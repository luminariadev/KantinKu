const fetch = require('node-fetch');
const baseUrl = 'http://localhost:3300/api';
let token = '';

beforeAll(async () => {
  // Login to get token
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', password: 'testpassword' })
  });
  const loginData = await loginResponse.json();
  token = loginData.token;
});

describe('Favorite Feature API Tests', () => {
  let testMenuId = null;

  test('Get all menus', async () => {
    const response = await fetch(`${baseUrl}/menu`);
    expect(response.status).toBe(200);
    const menus = await response.json();
    expect(Array.isArray(menus)).toBe(true);
    if (menus.length > 0) {
      testMenuId = menus[0].id_menu;
    }
  });

  test('Add menu to favorites', async () => {
    if (!testMenuId) return;
    const response = await fetch(`${baseUrl}/menu/favorites/${testMenuId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect([200, 201]).toContain(response.status);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Get user favorite menus', async () => {
    const response = await fetch(`${baseUrl}/menu/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(response.status).toBe(200);
    const favorites = await response.json();
    expect(Array.isArray(favorites)).toBe(true);
    if (testMenuId) {
      const found = favorites.some(fav => fav.id_menu === testMenuId);
      expect(found).toBe(true);
    }
  });

  test('Remove menu from favorites', async () => {
    if (!testMenuId) return;
    const response = await fetch(`${baseUrl}/menu/favorites/${testMenuId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Confirm menu removed from favorites', async () => {
    const response = await fetch(`${baseUrl}/menu/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(response.status).toBe(200);
    const favorites = await response.json();
    if (testMenuId) {
      const found = favorites.some(fav => fav.id_menu === testMenuId);
      expect(found).toBe(false);
    }
  });
});
