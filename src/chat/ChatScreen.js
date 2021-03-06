/** @module src/chat/ChatScreen */

import React, { Component } from 'react';
import {
  View,
  SectionList,
  Text,
  ActivityIndicator,
  AppState,
  BackHandler,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast';
import Moment from 'moment';

import FCMClient from '../FCMClient';
import { palette } from '../common/styles';
import { getStateParam } from '../common/helpers';
import Touchable from '../common/Touchable';
import authService from '../auth/authService';
import chatService from './chatService';
import ChatMessage from './ChatMessage';
import ChatScreenHeader from './ChatScreenHeader';
import ChatScreenInput from './ChatScreenInput';
import MessageSectionsMap from './MessageSectionsMap';
import styles from './ChatScreen.styles';

/**
 * Screen component for chat.
 * @extends Component
 */
class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: <ChatScreenHeader navigation={navigation} />
  })

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      sections: [],
      messageCount: 0,
      stickyDate: 0,
      isStickyDateVisible: false,
      toSend: getStateParam(props.navigation, 'toSend', ''),
      sendQueue: [],
      token: '',
      userId: 0,
      companionId: getStateParam(props.navigation, 'uid', 0),
      offset: 0
    };

    this.sectionsMap = new MessageSectionsMap();
  }

  componentWillMount() {
    this.setState({ userId: authService.getUser().userId });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  componentDidMount() {
    FCMClient.clearNotification();

    chatService.addEventListener(chatService.onConnect, this.onConnect);
    chatService.addEventListener(chatService.onReceive, this.onReceive);
    chatService.addEventListener(chatService.onError, this.onClose);
    chatService.addEventListener(chatService.onClose, this.onClose);

    this.props.navigation.setParams({ goBackHandler: this.goBackHandler });

    BackHandler.addEventListener('hardwareBackPress', this.goBackHandler);
  }

  componentWillUnmount() {
    this.clearListeners();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow(e) {
    this.setState({offset: e.endCoordinates.height})
  }

  _keyboardDidHide() {
    this.setState({offset: 0})
  }

  onConnect = () => {
    this.loadMessages();

    if (getStateParam(this.props.navigation, 'markAsRead', false)) this.markAsRead(this.state.companionId);
  };

  onReceive = (evt) => {
    try {
      const data = JSON.parse(evt.data);

      switch (data.type) {
        case 'history':
          this.onMessagesLoad(data.info);

          break;
        case 'message':
          this.onMessageReceive(data, evt.timeStamp);

          break;
        case 'success':
          if (/^READ-/.test(data.id)) break;

          this.onMessageSent(data.id);

          break;
        default:
          break;
      }
    } catch (e) {
      Toast.show('Server error', 2000);
    } finally {
      this.resetIndicators();
    }
  };

  onClose = () => {
    Toast.show('Nettverksfeil', 2000);
    this.resetIndicators();
  };

  onMessagesLoad = (messages) => {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      message.time = Moment.utc(message.time).local();

      this.sectionsMap.get(this.timestampToDateStamp(message.time)).push(message);
    }

    this.setState({
      sections: this.sectionsMap.toList(),
      messageCount: this.state.messageCount + messages.length
    });
  };

  onMessageReceive = (data, timeStamp) => {
    const message = {
      id: data.id,
      uid: data.uid,
      message: data.text,
      time: Moment(timeStamp),
      isRead: true
    };

    this.sectionsMap.get(this.timestampToDateStamp(message.time)).unshift(message);

    this.setState({ sections: this.sectionsMap.toList(), messageCount: this.state.messageCount + 1 });

    if (AppState.currentState === 'active') {
      chatService.dispatch({ type: 'success', id: data.id });
      this.markAsRead(this.state.companionId);
    }
  };

  onMessageSent = (messageId) => {
    this.setState({ sendQueue: this.state.sendQueue.filter(id => id !== messageId) });
  };

  onWrite = (toSend) => {
    this.setState({ toSend });
  };

  onSubmit = () => {
    if (this.state.toSend.length > 0) this.sendMessage();
  };

  onEndReached = () => {
    if (this.state.isLoading) return;

    this.loadMessages(this.state.messageCount);
  };

  onViewableItemsChanged = ({ viewableItems: items }) => {
    const datestamp = items[items.length - 1].section.title;

    if (datestamp !== this.state.stickyDate) {
      this.setState({ stickyDate: datestamp });
    }
  };

  onScrollBegin = () => {
    this.setState({ isStickyDateVisible: true });
  };

  onScrollEnd = () => {
    this.setState({ isStickyDateVisible: false });
  };

  goBackHandler = () => {
    const { navigation } = this.props;

    if (getStateParam(navigation, 'goBack', false)) {
      navigation.goBack();
      getStateParam(navigation, 'onGoBack', () => {})();
    } else {
      navigation.navigate('Dialogs', { loadDialogs: true });
    }

    this.clearListeners();

    return true;
  };

  timestampToDateStamp = timestamp => Moment(timestamp).startOf('day').valueOf();

  loadMessages = (offset = 0) => {
    this.setState({ isLoading: true });

    chatService.send({
      type: 'history',
      uid: this.state.companionId,
      offset,
      limit: 30
    });
  };

  sendMessage = () => {
    const { toSend: text, userId, companionId, messageCount, sendQueue } = this.state;
    const timestamp = Moment();
    const message = {
      id: `${userId}${companionId}${timestamp.valueOf()}`,
      uid: userId,
      message: text,
      time: timestamp,
      isRead: false
    };

    chatService.send({
      type: 'message',
      text,
      uid: companionId,
      id: message.id
    });

    this.sectionsMap.get(this.timestampToDateStamp(message.time)).unshift(message);

    this.setState({
      sections: this.sectionsMap.toList(),
      toSend: '',
      sendQueue: [...sendQueue, message.id],
      messageCount: messageCount + 1
    });
  };

  markAsRead = (uid) => {
    chatService.send({ type: 'read', id: `READ-${uid}`, uid });
  };

  resetIndicators = () => {
    this.setState({ isLoading: false });
  };

  clearListeners = () => {
    chatService.removeEventListener(chatService.onConnect, this.onConnect);
    chatService.removeEventListener(chatService.onReceive, this.onReceive);
    chatService.removeEventListener(chatService.onError, this.onClose);
    chatService.removeEventListener(chatService.onClose, this.onClose);

    BackHandler.removeEventListener('hardwareBackPress');
  };

  keyExtractor = (message, index) => (index != null ? `${message.uid}${index}` : message.title);

  renderMessage = ({ item }) => (
    <ChatMessage
      isOwn={item.uid === this.state.userId}
      isSent={this.state.sendQueue.indexOf(item.id) < 0}
      text={item.message}
      time={item.time}
    />
  );

  renderSectionDate = datestamp => <Text style={styles.sectionDate}>{Moment(datestamp).format('LL')}</Text>;

  renderSectionFooter = ({ section }) => this.renderSectionDate(section.title);

  render() {
    const { sections, stickyDate, toSend, sendQueue, isLoading, isStickyDateVisible } = this.state;
    const { offset } = this.state

    return (
      <View style={[styles.container, {marginBottom: offset}]}>
        {isStickyDateVisible && (
          <View style={styles.sectionDateSticky}>
            {this.renderSectionDate(stickyDate)}
          </View>
        )}
        {isLoading && <ActivityIndicator animate size="large" style={styles.loadingIndicator} />}
        <View style={styles.chat}>
          <SectionList
            sections={sections}
            extraData={sendQueue}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderMessage}
            renderSectionFooter={this.renderSectionFooter}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={0.01}
            onViewableItemsChanged={this.onViewableItemsChanged}
            onScrollBeginDrag={this.onScrollBegin}
            onScrollEndDrag={this.onScrollEnd}
            scrollEventThrottle={16}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={50}
            removeClippedSubviews
            inverted
          />
        </View>
        <View style={styles.controls}>
          <ChatScreenInput value={toSend} onChangeText={this.onWrite} onSubmitEditing={this.onSubmit} />
          <Touchable onPress={this.onSubmit}>
            <Icon name="send" size={24} color={palette[0]} style={styles.sendButton} />
          </Touchable>
        </View>
      </View>
    );
  }
}

export default ChatScreen;
