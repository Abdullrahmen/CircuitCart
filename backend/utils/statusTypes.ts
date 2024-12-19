// must be uppercase and in order (process after pending, etc.)
export default {
  PRODUCT: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    TO_WAREHOUSE: 'DELIVERING TO WAREHOUSE',
    AT_WAREHOUSE: 'AT WAREHOUSE',
    COMPLETED: 'COMPLETED',
    ALL: [
      'PENDING', // Automatically set when product is created
      'PROCESSING', // Set by seller when product is being processed
      'DELIVERING TO WAREHOUSE', // Set by seller when product is being delivered to warehouse
      'AT WAREHOUSE', // Set by manager when product is at warehouse
      'COMPLETED', // Automatically set when product is delivered
    ],
  },
  ORDER: {
    AWAITING_PRODUCTS_RECEPTION: 'AWAITING PRODUCTS RECEPTION',
    AT_WAREHOUSE: 'AT WAREHOUSE',
    OUT_FOR_DELIVERY: 'OUT FOR DELIVERY',
    DELIVERED: 'DELIVERED',
    ALL: [
      'AWAITING PRODUCTS RECEPTION', //Automatically set when order is created
      'AT WAREHOUSE', //Automatically set when all products are at warehouse
      'OUT FOR DELIVERY', //Set by manager when order is ready to be delivered
      'DELIVERED', //Set by manager when order is delivered
    ],
  },
};
