import productsData from './products';

export const allProducts: any[] = [
  ...productsData.products,
];

export function getProductById(id: string): any | undefined {
  return allProducts.find((p) => p.id === id);
}

export { productsData };
