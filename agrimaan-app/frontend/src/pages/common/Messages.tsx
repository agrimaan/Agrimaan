import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Send,
  AttachFile,
  MoreVert,
  Search,
  Star,
  Delete,
  Reply,
  Forward,
  MarkAsUnread,
  Archive
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  threadId?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

const Messages: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeDialog, setComposeDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/messages/conversations', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`/api/messages/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
        receiverId: selectedConversation.participants.find(p => p !== user?.id)
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setNewMessage('');
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleComposeMessage = async () => {
    if (!composeData.to || !composeData.content) return;

    try {
      await axios.post('/api/messages', composeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setComposeDialog(false);
      setComposeData({ to: '', subject: '', content: '', priority: 'medium' });
      fetchConversations();
    } catch (error) {
      console.error('Error composing message:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const MessageList = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Conversations</Typography>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setComposeDialog(true)}
            size="small"
          >
            New Message
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {conversations
            .filter(conv => 
              conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              conv.lastMessage.senderName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((conversation) => (
              <ListItem
                key={conversation.id}
                button
                selected={selectedConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={conversation.unreadCount === 0}
                  >
                    <Avatar>
                      {conversation.lastMessage.senderName.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">
                        {conversation.lastMessage.senderName}
                      </Typography>
                      <Chip
                        label={conversation.lastMessage.priority}
                        size="small"
                        color={getPriorityColor(conversation.lastMessage.priority)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" noWrap>
                        {conversation.lastMessage.subject}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(conversation.lastMessage.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                {conversation.unreadCount > 0 && (
                  <Chip
                    label={conversation.unreadCount}
                    size="small"
                    color="primary"
                  />
                )}
              </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  );

  const MessageThread = () => {
    if (!selectedConversation) {
      return (
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              Select a conversation to view messages
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {selectedConversation.participants.find(p => p !== user?.id)}
            </Typography>
            <Box>
              <IconButton size="small">
                <Star />
              </IconButton>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Box height={400} overflow="auto" mb={2}>
            <List>
              {messages.map((message) => (
                <ListItem key={message.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      {message.senderName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: message.senderId === user?.id ? 'primary.main' : 'grey.100',
                      color: message.senderId === user?.id ? 'white' : 'inherit',
                      ml: message.senderId === user?.id ? 'auto' : 0,
                      mr: message.senderId === user?.id ? 0 : 'auto'
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Typography variant="caption" display="block" textAlign="right">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              size="small"
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <Send />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Messages</Typography>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => setComposeDialog(true)}
        >
          Compose
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <MessageList />
          </Grid>
          <Grid item xs={12} md={8}>
            <MessageThread />
          </Grid>
        </Grid>
      )}

      <Dialog open={composeDialog} onClose={() => setComposeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="To"
            value={composeData.to}
            onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subject"
            value={composeData.subject}
            onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={composeData.priority}
              onChange={(e) => setComposeData({ ...composeData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={composeData.content}
            onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeDialog(false)}>Cancel</Button>
          <Button onClick={handleComposeMessage} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;