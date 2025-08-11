declare module '@paystack/inline-js' {
  interface PaystackPop {
    new (): PaystackPop;
    newTransaction: (params: {
      key: string;
      email: string;
      amount: number;
      ref?: string;
      currency?: string;
      callback?: (response: any) => void;
      onClose?: () => void;
      [key: string]: any;
    }) => void;
  }

  const paystack: PaystackPop;
  export = paystack;
}
