import React from 'react';

export interface NotificationToastData {
  id: string;
  title: string;
  message: string;
  level: 'CRITICAL' | 'HIGH' | 'INFO';
  timestamp: string;
  locationName?: string;
  district?: string;
  roadName?: string;
  actionTab?: string;
}

interface AuthorityNotificationToastProps {
  notifications: NotificationToastData[];
  onDismiss: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  onAction?: (tab: string) => void;
}

export const AuthorityNotificationToast: React.FC<AuthorityNotificationToastProps> = () => {
  // Floating bottom-right toasts removed in favor of notifications drawer
  return null;
};
