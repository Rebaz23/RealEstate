export type SearchStackParamList = {
  Chat: undefined;
  ListingDetail: { listingId: string };
  Feedback: { listingId: string };
};

export type NotificationsStackParamList = {
  Notifications: undefined;
  ListingDetail: { listingId: string };
  Feedback: { listingId: string };
};

export type TabParamList = {
  SearchTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};
