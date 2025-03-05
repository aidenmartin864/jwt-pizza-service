const { DB } = require('./database'); // Adjust path as needed

// Mocking the getConnection and query methods
jest.spyOn(DB, 'getConnection').mockImplementation(async () => ({
  execute: jest.fn(),
  end: jest.fn(),
}));

describe('getMenu', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return menu items successfully', async () => {
    const mockMenuItems = [
      { id: 1, title: 'Pizza', description: 'mmmmmm tasty pepperoni', price: 7 },
      { id: 2, title: 'Calzone', description: 'like a taco but pizza', price: 10 },
    ];

    // Mocking the query function to return mockMenuItems
    DB.query = jest.fn().mockResolvedValue(mockMenuItems);

    const result = await DB.getMenu();

    expect(DB.getConnection).toHaveBeenCalled();
    expect(DB.query).toHaveBeenCalledWith(expect.any(Object), 'SELECT * FROM menu');
    expect(result).toEqual(mockMenuItems);
  });

  test('closes database cleanly', async () => {
    const mockConnection = {
        execute: jest.fn().mockResolvedValue([[]]),
        end: jest.fn(),
      };
  
      DB.getConnection.mockResolvedValue(mockConnection);
      DB.query = jest.fn().mockResolvedValue([]);
  
      await DB.getMenu();
  
      expect(mockConnection.end).toHaveBeenCalled();
  });
});

describe('addMenuItem', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('should add menu items successfully', async () => {
      const mockItem = { title: 'Pizza', description: 'mmmmmm tasty pepperoni', price: 7 }
  
      DB.query = jest.fn().mockResolvedValue(mockItem);
  
      const result = await DB.addMenuItem(mockItem);
  
      expect(DB.getConnection).toHaveBeenCalled();
      expect(DB.query).toHaveBeenCalledWith(expect.any(Object), 'INSERT INTO menu (title, description, image, price) VALUES (?, ?, ?, ?)',[mockItem.title, mockItem.description, mockItem.image, mockItem.price]);
      expect(result).toEqual(mockItem);
    });
  
    test('closes database cleanly', async () => {
        const mockConnection = {
            execute: jest.fn().mockResolvedValue([[]]),
            end: jest.fn(),
          };
      
          DB.getConnection.mockResolvedValue(mockConnection);
          DB.query = jest.fn().mockResolvedValue([]);
          
          const mockItem = { id: 1, title: 'Pizza', description: 'mmmmmm tasty pepperoni', price: 7 }
          await DB.addMenuItem(mockItem);
          
          expect(mockConnection.end).toHaveBeenCalled();
    });
});

describe('updateUser', () => {
  test('updates user values for password or email', async () => {

  });

  test('closes database cleanly', async () => {
      const mockConnection = {
        execute: jest.fn().mockResolvedValue([[]]),
        end: jest.fn(),
      };
  
      DB.getConnection.mockResolvedValue(mockConnection);
      DB.query = jest.fn().mockResolvedValue([]);
      
      const mockUserId = "daboss";
      const mockEmail = "daboss@hotmail.com";
      const mockPassword = "skibidi";
      await DB.updateUser(mockUserId, mockEmail, mockPassword);
      
      expect(mockConnection.end).toHaveBeenCalled();
  });
});