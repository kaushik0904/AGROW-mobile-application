import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActionSheetIOS } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../common/theme';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import PostCard from '../../components/PostCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const tags = ['🔥 Trending', '🌾 Crops', '💧 Irrigation', '🐛 Pests', '📈 Prices'];

export default function SocialScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('foryou');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const currentUserId = user?.id;

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/posts?tab=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission needed', 'You need to grant camera roll permissions to upload media.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'], // Enable video selection
        allowsEditing: true,
        quality: 0.7,
        base64: true, // We need base64 to send it easily
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        // Send as a data URI string
        const base64Data = `data:${pickerResult.assets[0].mimeType || 'image/jpeg'};base64,${pickerResult.assets[0].base64}`;
        setSelectedImage({ uri: pickerResult.assets[0].uri, base64: base64Data });
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Error', 'Could not select media');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) {
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingPostId 
        ? `${API_URL}/posts/${editingPostId}` 
        : `${API_URL}/posts`;
      const method = editingPostId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
          image_url: selectedImage ? selectedImage.base64 : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        setEditingPostId(null);
        setIsModalVisible(false);
        fetchPosts(); 
      } else {
        Alert.alert('Error', data.error || `Failed to ${editingPostId ? 'update' : 'post'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowToggle = async (postAuthorId, isCurrentlyFollowing) => {
    try {
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/users/${postAuthorId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Refresh posts to update the UI
        fetchPosts();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Could not update follow status');
      }
    } catch (error) {
       console.error('Error toggling follow:', error);
       Alert.alert('Error', 'Could not connect to the server');
    }
  };

  const handlePostOptions = (post) => {
    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Edit Post', 
          onPress: () => {
             setEditingPostId(post.id);
             setNewPostContent(post.content);
             if (post.image_url) {
                // If it's a full URL or base64 keep it as a uri for preview
                setSelectedImage({ uri: post.image_url, base64: post.image_url.startsWith('data:') ? post.image_url : null });
             }
             setIsModalVisible(true);
          } 
        },
        { 
          text: 'Delete Post', 
          style: 'destructive',
          onPress: () => handleDeletePost(post.id) 
        }
      ]
    );
  };

  const handleDeletePost = async (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
         try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              fetchPosts();
            } else {
              Alert.alert('Error', 'Failed to delete post');
            }
         } catch (e) {
            Alert.alert('Error', 'Could not connect to server');
         }
      }}
    ]);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  // Helper function to format timestamp
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const goToProfile = (userId) => {
    navigation.navigate('PublicProfile', { userId });
  };

  return (
    <View style={styles.screen}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.title}>Community Feed</Text>
        <Text style={styles.subtitle}>Connect with farmers near you</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'foryou' && styles.activeTab]} 
          onPress={() => setActiveTab('foryou')}
        >
          <Text style={[styles.tabText, activeTab === 'foryou' && styles.activeTabText]}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'following' && styles.activeTab]} 
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'yourposts' && styles.activeTab]} 
          onPress={() => setActiveTab('yourposts')}
        >
          <Text style={[styles.tabText, activeTab === 'yourposts' && styles.activeTabText]}>Your Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <View style={styles.feed}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : posts.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textMuted }}>No posts yet. Be the first!</Text>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              token={token}
              onProfilePress={() => goToProfile(post.farmer_id)}
              onOptionsPress={handlePostOptions}
              // We pass down the follow toggle function from the parent to trigger re-fetches if desired
              onFollowToggle={() => handleFollowToggle(post.farmer_id, post.is_following)}
            />
          ))
        )}
      </View>
    </ScrollView>
    
    {/* Floating Action Button */}
    <TouchableOpacity 
      style={[styles.fab, { bottom: insets.bottom + 20 }]} 
      activeOpacity={0.8}
      onPress={() => setIsModalVisible(true)}
    >
      <Ionicons name={activeTab === 'yourposts' ? "pencil" : "add"} size={32} color={colors.white} />
    </TouchableOpacity>

    {/* Create/Edit Post Modal */}
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setIsModalVisible(false);
        setNewPostContent('');
        setSelectedImage(null);
        setEditingPostId(null);
      }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setIsModalVisible(false);
            setNewPostContent('');
            setSelectedImage(null);
            setEditingPostId(null);
          }} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleCreatePost} 
            disabled={(!newPostContent.trim() && !selectedImage) || isSubmitting}
            style={[styles.modalPostBtn, ((!newPostContent.trim() && !selectedImage) || isSubmitting) && styles.modalPostBtnDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.modalPostText}>{editingPostId ? 'Save' : 'Post'}</Text>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="What's happening?"
          placeholderTextColor={colors.textSecondary}
          multiline
          autoFocus
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removePreviewBtn} 
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.modalToolbar}>
          <TouchableOpacity style={styles.toolbarAction} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  tabsRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.borderLight,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  tabText: { 
    fontSize: 15, 
    fontFamily: fonts.bodyMedium, 
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontFamily: fonts.headingSemiBold,
  },
  feed: { marginTop: 0 },
  tweetContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tweetLeft: { marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
  },
  tweetRight: { flex: 1 },
  tweetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  optionsBtn: {
    padding: 4,
  },
  followBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  followingBtn: {
    backgroundColor: colors.surface,
  },
  followBtnText: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDark,
  },
  followingBtnText: {
    color: colors.textSecondary,
  },
  authorName: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: 4,
  },
  authorHandle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  dot: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  timeAgo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tweetCategory: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  tweetContent: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 32,
    marginTop: 4,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontFamily: fonts.body, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalCancelText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalPostBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalPostBtnDisabled: {
    backgroundColor: colors.primaryLight,
  },
  modalPostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  modalInput: {
    flex: 1,
    padding: 16,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  modalToolbar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  toolbarAction: {
    padding: 8,
  },
  previewContainer: {
    margin: 16,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 250,
    height: 180,
    borderRadius: 12,
  },
  removePreviewBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
