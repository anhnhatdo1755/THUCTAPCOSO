// Xử lý đường dẫn ảnh sản phẩm
const API_URL = process.env.API_URL || 'http://localhost:3000';

function getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}/${imagePath}`;
}

function processProductData(product) {
  if (!product) return null;
  return {
    ...product,
    image: getFullImageUrl(product.image)
  };
}

function processProductsData(products) {
  if (!Array.isArray(products)) return [];
  return products.map(processProductData);
}

module.exports = {
  getFullImageUrl,
  processProductData,
  processProductsData
}; 