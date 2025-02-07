export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Quote {
  quoteId: string;
  createdDate: string;
  totalPrice: number;
  items: QuoteItem[];
}
