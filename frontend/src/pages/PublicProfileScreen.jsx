import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../common/theme';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PublicProfileScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { token, user: currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // If the user taps on their own profile, they should theoretically just go to the Profile tab.
  // But just in case this gets loaded for the current user, we will handle it cleanly.

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch public profile
      const profileRes = await fetch(`${API_URL}/users/${userId}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      
      // Fetch posts
      const postsRes = await fetch(`${API_URL}/posts?user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const postsData = await postsRes.json();

      if (profileRes.ok && postsRes.ok) {
        setProfile(profileData.user);
        setPosts(postsData.posts || []);
      } else {
        Alert.alert('Error', 'Failed to load profile details');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Failed to fetch public profile data:', err);
      Alert.alert('Error', 'Could not connect to the server');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, navigation]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [fetchData, userId]);

  const handleFollowToggle = async () => {
    if (isTogglingFollow) return;
    setIsTogglingFollow(true);
    try {
      const isCurrentlyFollowing = profile.is_following;
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Optimistically update the UI
        setProfile(prev => ({
          ...prev,
          is_following: !isCurrentlyFollowing,
          followersCount: isCurrentlyFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        }));
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Could not update follow status');
      }
    } catch (error) {
       console.error('Error toggling follow:', error);
       Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

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

  if (isLoading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.screen}>
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle} numberOfLines={1}>{profile.name}</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.coverBg}
          />
          <View style={styles.profileInfoContainer}>
             <View style={styles.avatarRow}>
                <Image
                  source={{ uri: profile.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60' }}
                  style={styles.avatar}
                />
                {currentUser?.id !== userId && (
                  <TouchableOpacity 
                    style={[styles.followBtn, profile.is_following && styles.followingBtn]} 
                    onPress={handleFollowToggle}
                    disabled={isTogglingFollow}
                  >
                    <Text style={[styles.followBtnText, profile.is_following && styles.followingBtnText]}>
                      {profile.is_following ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
             </View>

             <Text style={styles.userName}>{profile.name}</Text>
             <Text style={styles.userHandle}>@{profile.name.toLowerCase().replace(/\s+/g, '')}</Text>

             {(profile.farm_name || profile.farm_size || profile.location) && (
               <View style={styles.metaContainer}>
                  {profile.farm_name && (
                    <Text style={styles.farmName}>{profile.farm_name}</Text>
                  )}
                  <View style={styles.metaRow}>
                    {profile.farm_size && (
                      <View style={styles.metaItem}>
                        <Ionicons name="resize-outline" size={12} color={colors.textMuted} />
                        <Text style={styles.metaText}>{profile.farm_size}</Text>
                      </View>
                    )}
                    {profile.location && (
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={styles.metaText}>{profile.location}</Text>
                      </View>
                    )}
                  </View>
               </View>
             )}

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Text style={styles.statNumber}>{profile.followingCount || 0}</Text>
                 <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statBox}>
                 <Text style={styles.statNumber}>{profile.followersCount || 0}</Text>
                 <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Posts</Text>
          <View style={styles.sectionIndicator} />
        </View>

        {/* Posts Feed */}
        <View style={styles.feed}>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>No posts to show.</Text>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                token={token}
                /* onProfilePress missing safely - avoids tapping self in a loop */
              />
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  appBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  appBarTitle: {
    color: colors.white,
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    flex: 1,
  },
  profileHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 16,
  },
  coverBg: {
    height: 120,
    width: '100%',
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    marginTop: -40, // overlap cover
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.gray200,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 4,
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  followBtnText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  followingBtnText: {
    color: colors.textPrimary,
  },
  userName: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  userHandle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 16,
  },
  farmName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statNumber: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionIndicator: {
    height: 3,
    backgroundColor: colors.primary,
    width: 60,
    marginLeft: 16,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  feed: {
    backgroundColor: colors.surface,
    paddingTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
    fontFamily: fonts.body,
  }
});
