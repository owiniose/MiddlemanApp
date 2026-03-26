export type RootStackParamList = {
  Main: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string; vendorName: string; total: number };
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  CategoryList: { category: string };
  VendorDetail: {
    id: string;
    title: string;
    subtitle: string;
    rating: string;
  };
};

export type SearchStackParamList = {
  SearchScreen: undefined;
  VendorDetail: {
    id: string;
    title: string;
    subtitle: string;
    rating: string;
  };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};
