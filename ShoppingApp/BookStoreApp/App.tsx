import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  Switch // Switch'i ekledik
} from 'react-native';

const API_KEY = 'pUrSZJhqhd3LjCOrKMhYPpuGmAnaJmAW'; // NYT API anahtarınızı buraya ekleyin
const API_URL = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`;

// Sepet öğesi bileşeni
const CartItem = ({ item, onUpdateQuantity }) => {
  return (
    <View style={styles.cartItem}>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.author}>Yazar: {item.author}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        >
          <Text>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity 
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        >
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );
};

// Kitap öğesi bileşeni
const BookItem = ({ book, onAddToCart }) => {
  return (
    <View style={styles.bookItem}>
      <Image 
        source={{ uri: book.book_image }} 
        style={styles.bookImage}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={styles.price}>${book.price}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onAddToCart(book)}
        >
          <Text style={styles.addButtonText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [isStudentDiscount, setIsStudentDiscount] = useState(false); // Öğrenci indirimi için state

  // NYT API'den kitapları getir
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      // Kitap verilerini düzenle ve fiyat ekle
      const processedBooks = data.results.books.map(book => ({
        ...book,
        id: book.primary_isbn13,
        price: (Math.random() * (30 - 10) + 10).toFixed(2) // Örnek fiyat
      }));
      
      setBooks(processedBooks);
      setIsLoading(false);
    } catch (err) {
      setError('Kitaplar yüklenirken bir hata oluştu');
      setIsLoading(false);
    }
  };

  // Sepete kitap ekleme
  const addToCart = (book) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === book.id);
      
      if (existingItem) {
        return currentCart.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentCart, { ...book, quantity: 1 }];
    });
  };

  // Sepetteki ürün miktarını güncelleme
  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      setCart(currentCart => currentCart.filter(item => item.id !== bookId));
      return;
    }
    
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === bookId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Sepet toplamını hesapla
  const getCartTotal = () => {
    let total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Öğrenci indirimi uygulanıyorsa toplamın %25'ini çıkar
    if (isStudentDiscount) {
      total = total * 0.75; // %25 indirim
    }

    return total.toFixed(2);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {showCart ? 'Sepetim' : 'NYT En Çok Satan Kitaplar'}
        </Text>
        <TouchableOpacity onPress={() => setShowCart(!showCart)}>
          <Text style={styles.headerButton}>
            {showCart ? 'Kitaplara Dön' : `Sepet (${cart.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {showCart ? (
        <View style={styles.cartContainer}>
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CartItem 
                item={item} 
                onUpdateQuantity={updateQuantity}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyCart}>Sepetiniz boş</Text>
            }
            ListFooterComponent={
              cart.length > 0 && (
                <View style={styles.totalContainer}>
                  {/* Öğrenci İndirimi Switch'i */}
                  <View style={styles.switchContainer}>
                    <Text>Öğrenci İndirimi: %25</Text>
                    <Switch 
                      value={isStudentDiscount}
                      onValueChange={setIsStudentDiscount}
                    />
                  </View>
                  <Text style={styles.totalText}>
                    Toplam: ${getCartTotal()}
                  </Text>
                </View>
              )
            }
          />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BookItem 
              book={item} 
              onAddToCart={addToCart}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 4,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartContainer: {
    flex: 1,
  },
  totalContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default App;
