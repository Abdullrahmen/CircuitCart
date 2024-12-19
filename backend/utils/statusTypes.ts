export default {
  PRODUCT: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    TO_WAREHOUSE: 'Delivering to Warehouse',
    AT_WAREHOUSE: 'At Warehouse',
    ALL: ['PENDING', 'PROCESSING', 'Delivering to Warehouse', 'At Warehouse'],
  },
  ORDER: {
    PENDING: 'PENDING',
    AWAITING_PRODUCTS_RECEPTION: 'AWAITING PRODUCTS RECEPTION',
    SHIPPED: 'SHIPPED',
    IN_TRANSIT: 'IN_TRANSIT',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    ALL: [
      'PENDING',
      'AWAITING PRODUCTS RECEPTION',
      'SHIPPED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ],
  },
};
