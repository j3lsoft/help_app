export interface ChatUser {
  id: string;
  userName: string;
  userProfilePic: string;
  userProfileName: string;
  lastMsg: string;
  lastMsgTime: string;
  isActive: boolean;
}

export type CallingType = 'missed' | 'incoming' | 'outgoing';

export interface CallLog {
  id: string;
  userProfilePic: string;
  userProfileName: string;
  callingType: CallingType;
  callingTime: string;
  isActive: boolean;
}
