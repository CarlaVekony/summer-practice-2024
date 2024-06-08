import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/config_fb';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import './home.css';

export const Home = () => {
    const [email, setEmail] = useState('');
    const [groupName, setGroupName] = useState('');
    const [message, setMessage] = useState('');
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser) {
            fetchFriendsAndRequests();
            fetchGroups();
        }
    }, []);

    const fetchFriendsAndRequests = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No user is currently signed in.');
            return;
        }
        const userId = currentUser.uid;

        try {
            // Fetch accepted friends where current user is sender or receiver
            const friendsRef = collection(db, 'Friends');
            const friendsQuerySender = query(friendsRef, where('accepted', '==', true), where('sender', '==', userId));
            const friendsQueryReceiver = query(friendsRef, where('accepted', '==', true), where('receiver', '==', userId));

            const friendsQuerySnapshotSender = await getDocs(friendsQuerySender);
            const friendsQuerySnapshotReceiver = await getDocs(friendsQueryReceiver);

            const friendsList = new Set();

            friendsQuerySnapshotSender.forEach((doc) => {
                friendsList.add(doc.data().receiver);
            });

            friendsQuerySnapshotReceiver.forEach((doc) => {
                friendsList.add(doc.data().sender);
            });

            const friendDetails = [];
            for (const friendId of friendsList) {
                const friendDoc = await getDoc(doc(db, 'User', friendId));
                if (friendDoc.exists()) {
                    friendDetails.push({id: friendDoc.id, ...friendDoc.data()});
                }
            }
            setFriends(friendDetails);

            // Fetch friend requests where current user is receiver and accepted is false
            const friendRequestsQuery = query(friendsRef, where('accepted', '==', false), where('receiver', '==', userId));
            const friendRequestsQuerySnapshot = await getDocs(friendRequestsQuery);
            const friendRequestsList = [];
            friendRequestsQuerySnapshot.forEach((doc) => {
                friendRequestsList.push({id: doc.id, ...doc.data()});
            });

            const requestDetails = [];
            for (const request of friendRequestsList) {
                const senderDoc = await getDoc(doc(db, 'User', request.sender));
                if (senderDoc.exists()) {
                    requestDetails.push({id: request.id, senderId: request.sender, ...senderDoc.data()});
                }
            }
            setFriendRequests(requestDetails);

            console.log('Friends:', friendDetails);
            console.log('Friend Requests:', requestDetails);
        } catch (error) {
            console.error('Error fetching friends and requests:', error);
        }
    };

    const handleAddFriend = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No user is currently signed in.');
            }
            const senderId = currentUser.uid;

            const userRef = collection(db, 'User');
            const q = query(userRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('No user found with the provided email.');
            }

            let receiverId;
            querySnapshot.forEach((doc) => {
                receiverId = doc.id;
            });

            if (!receiverId) {
                throw new Error('Failed to get the receiver user ID.');
            }

            const friendRef = doc(collection(db, 'Friends'));
            await setDoc(friendRef, {
                sender: senderId,
                receiver: receiverId,
                accepted: false,
            });

            setMessage('Friend request sent successfully!');
            fetchFriendsAndRequests(); // Refetch data to update state
        } catch (error) {
            console.error('Error adding friend:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleAcceptFriend = async (requestId) => {
        try {
            const friendRef = doc(db, 'Friends', requestId);
            await updateDoc(friendRef, {accepted: true});
            setMessage('Friend request accepted!');
            fetchFriendsAndRequests(); // Refetch data to update state
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleRejectFriend = async (requestId) => {
        try {
            const friendRef = doc(db, 'Friends', requestId);
            await deleteDoc(friendRef);
            setMessage('Friend request rejected!');
            fetchFriendsAndRequests(); // Refetch data to update state
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleCreateGroup = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No user is currently signed in.');
            }
            const creatorId = currentUser.uid;

            const groupRef = doc(collection(db, 'Groups'));
            await setDoc(groupRef, {
                name: groupName,
                creator: creatorId,
                userIds: [creatorId],
            });

            setMessage('Group created successfully!');
            setGroupName('');
            fetchGroups(); // Refetch data to update state
        } catch (error) {
            console.error('Error creating group:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const fetchGroups = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No user is currently signed in.');
            return;
        }
        const userId = currentUser.uid;

        try {
            // Fetch groups where current user is a member
            const groupsRef = collection(db, 'Groups');
            const groupsQuery = query(groupsRef, where('userIds', 'array-contains', userId));
            const groupsQuerySnapshot = await getDocs(groupsQuery);

            const groupsList = [];
            groupsQuerySnapshot.forEach((doc) => {
                groupsList.push({id: doc.id, ...doc.data()});
            });

            setGroups(groupsList);
            console.log('Groups:', groupsList);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleAddUserToGroup = async (groupId, friendEmail) => {
        try {
            const userRef = collection(db, 'User');
            const q = query(userRef, where('email', '==', friendEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('No user found with the provided email.');
            }

            let friendId;
            querySnapshot.forEach((doc) => {
                friendId = doc.id;
            });

            if (!friendId) {
                throw new Error('Failed to get the friend user ID.');
            }

            const groupRef = doc(db, 'Groups', groupId);
            await updateDoc(groupRef, {userIds: arrayUnion(friendId)});

            setMessage('User added to group successfully!');
            fetchGroups(); // Refetch data to update state
        } catch (error) {
            console.error('Error adding user to group:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleRemoveUserFromGroup = async (groupId, friendId) => {
        try {
            const groupRef = doc(db, 'Groups', groupId);
            await updateDoc(groupRef, {userIds: arrayRemove(friendId)});

            setMessage('User removed from group successfully!');
            fetchGroups(); // Refetch data to update state
        } catch (error) {
            console.error('Error removing user from group:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            const groupRef = doc(db, 'Groups', groupId);
            await deleteDoc(groupRef);

            setMessage('Group deleted successfully!');
            fetchGroups(); // Refetch data to update state
        } catch (error) {
            console.error('Error deleting group:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleViewGroupActivities = (groupId) => {
        navigate(`/view/${groupId}`);
    };

    return (
        <div className="home-container">
            <div className="add-friend-container">
                <h2>Add Friend</h2>
                <input
                    type="email"
                    placeholder="Enter friend's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleAddFriend}>Add Friend</button>
                {message && <p>{message}</p>}
            </div>

            <div className="friends-container">
                <h2>Friends</h2>
                {friends.length > 0 ? (
                    <ul>
                        {friends.map((friend) => (
                            <li key={friend.id}>{friend.email}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No friends found</p>
                )}
            </div>

            <div className="friend-requests-container">
                <h2>Friend Requests</h2>
                {friendRequests.length > 0 ? (
                    <ul>
                        {friendRequests.map((request) => (
                            <li key={request.id}>
                                {request.email}
                                <button onClick={() => handleAcceptFriend(request.id)}>Accept</button>
                                <button onClick={() => handleRejectFriend(request.id)}>Reject</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No friend requests</p>
                )}
            </div>

            <div className="create-group-container">
                <h2>Create Group</h2>
                <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <button onClick={handleCreateGroup}>Create Group</button>
                {message && <p>{message}</p>}
            </div>

            <div className="groups-container">
                <h2>Groups</h2>
                {groups.length > 0 ? (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                {group.name}
                                {group.creator === auth.currentUser.uid && (
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Enter friend's email to add"
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <button onClick={() => handleAddUserToGroup(group.id, email)}>Add User</button>
                                        <button onClick={() => handleRemoveUserFromGroup(group.id, email)}>Remove User
                                        </button>
                                        <button onClick={() => handleDeleteGroup(group.id)}>Delete Group</button>
                                    </div>
                                )}
                                <button onClick={() => handleViewGroupActivities(group.id)}>View Group Activities
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No groups found</p>
                )}
            </div>
        </div>
    );
}