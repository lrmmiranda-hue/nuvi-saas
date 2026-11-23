import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Tenant, Product, Order, GlobalSaaSConfig } from '../types';

// Coleções do Firestore
export const COLLECTIONS = {
  TENANTS: 'tenants',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  GLOBAL_CONFIG: 'system_config',
};

/**
 * Escuta em tempo real as lojas (tenants) cadastradas no Firestore
 */
export const listenToTenants = (
  onData: (tenants: Tenant[]) => void,
  onError?: (err: any) => void
) => {
  try {
    const colRef = collection(db, COLLECTIONS.TENANTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const tenants: Tenant[] = [];
        snapshot.forEach((docSnap) => {
          tenants.push(docSnap.data() as Tenant);
        });
        onData(tenants);
      },
      (error) => {
        console.warn('Firestore listenToTenants aviso/erro:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Falha ao inicializar listener de tenants:', err);
    return () => {};
  }
};

/**
 * Salva ou atualiza uma loja no Firestore
 */
export const saveTenantFirestore = async (tenant: Tenant): Promise<void> => {
  try {
    if (!tenant.id) return;
    const docRef = doc(db, COLLECTIONS.TENANTS, tenant.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(tenant)), { merge: true });
  } catch (err) {
    console.warn('Falha ao salvar tenant no Firestore (usando fallback local):', err);
  }
};

/**
 * Salva todas as lojas em lote no Firestore
 */
export const saveAllTenantsFirestore = async (tenants: Tenant[]): Promise<void> => {
  try {
    if (!tenants || tenants.length === 0) return;
    const batch = writeBatch(db);
    tenants.forEach((tenant) => {
      if (tenant.id) {
        const ref = doc(db, COLLECTIONS.TENANTS, tenant.id);
        batch.set(ref, JSON.parse(JSON.stringify(tenant)), { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.warn('Falha ao salvar lote de tenants no Firestore:', err);
  }
};

/**
 * Remove permanentemente uma loja do Firestore e seus produtos e pedidos vinculados
 */
export const deleteTenantFirestore = async (tenantId: string): Promise<void> => {
  try {
    if (!tenantId) return;
    
    // 1. Deleta o documento da loja
    const tenantDocRef = doc(db, COLLECTIONS.TENANTS, tenantId);
    await deleteDoc(tenantDocRef);

    // 2. Busca e deleta todos os produtos da loja
    try {
      const prodsQuery = query(collection(db, COLLECTIONS.PRODUCTS), where('tenantId', '==', tenantId));
      const prodsSnapshot = await getDocs(prodsQuery);
      if (!prodsSnapshot.empty) {
        const batch = writeBatch(db);
        prodsSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Erro ao limpar produtos do tenant no Firestore:', e);
    }

    // 3. Busca e deleta todos os pedidos da loja
    try {
      const ordersQuery = query(collection(db, COLLECTIONS.ORDERS), where('tenantId', '==', tenantId));
      const ordersSnapshot = await getDocs(ordersQuery);
      if (!ordersSnapshot.empty) {
        const batch = writeBatch(db);
        ordersSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Erro ao limpar pedidos do tenant no Firestore:', e);
    }
  } catch (err) {
    console.warn('Falha ao deletar tenant no Firestore:', err);
  }
};

/**
 * Escuta em tempo real os produtos no Firestore
 */
export const listenToProducts = (
  onData: (products: Product[]) => void,
  onError?: (err: any) => void
) => {
  try {
    const colRef = collection(db, COLLECTIONS.PRODUCTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          products.push(docSnap.data() as Product);
        });
        onData(products);
      },
      (error) => {
        console.warn('Firestore listenToProducts aviso/erro:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Falha ao inicializar listener de produtos:', err);
    return () => {};
  }
};

/**
 * Salva ou atualiza um produto no Firestore
 */
export const saveProductFirestore = async (product: Product): Promise<void> => {
  try {
    if (!product.id) return;
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(product)), { merge: true });
  } catch (err) {
    console.warn('Falha ao salvar produto no Firestore:', err);
  }
};

/**
 * Salva todos os produtos em lote no Firestore
 */
export const saveAllProductsFirestore = async (products: Product[]): Promise<void> => {
  try {
    if (!products || products.length === 0) return;
    const batch = writeBatch(db);
    products.forEach((prod) => {
      if (prod.id) {
        const ref = doc(db, COLLECTIONS.PRODUCTS, prod.id);
        batch.set(ref, JSON.parse(JSON.stringify(prod)), { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.warn('Falha ao salvar lote de produtos no Firestore:', err);
  }
};

/**
 * Remove um produto permanentemente do Firestore
 */
export const deleteProductFirestore = async (productId: string): Promise<void> => {
  try {
    if (!productId) return;
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Falha ao deletar produto no Firestore:', err);
  }
};

/**
 * Escuta em tempo real os pedidos no Firestore
 */
export const listenToOrders = (
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
) => {
  try {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        onData(orders);
      },
      (error) => {
        console.warn('Firestore listenToOrders aviso/erro:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Falha ao inicializar listener de pedidos:', err);
    return () => {};
  }
};

/**
 * Salva ou atualiza um pedido no Firestore
 */
export const saveOrderFirestore = async (order: Order): Promise<void> => {
  try {
    if (!order.id) return;
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(order)), { merge: true });
  } catch (err) {
    console.warn('Falha ao salvar pedido no Firestore:', err);
  }
};

/**
 * Remove um pedido permanentemente do Firestore
 */
export const deleteOrderFirestore = async (orderId: string): Promise<void> => {
  try {
    if (!orderId) return;
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Falha ao deletar pedido no Firestore:', err);
  }
};

/**
 * Escuta em tempo real as configurações globais do SaaS no Firestore
 */
export const listenToGlobalConfig = (
  onData: (config: GlobalSaaSConfig) => void,
  onError?: (err: any) => void
) => {
  try {
    const docRef = doc(db, COLLECTIONS.GLOBAL_CONFIG, 'nuvi_master');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as GlobalSaaSConfig);
        }
      },
      (error) => {
        console.warn('Firestore listenToGlobalConfig aviso/erro:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Falha ao inicializar listener de config global:', err);
    return () => {};
  }
};

/**
 * Salva as configurações globais no Firestore
 */
export const saveGlobalConfigFirestore = async (config: GlobalSaaSConfig): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.GLOBAL_CONFIG, 'nuvi_master');
    await setDoc(docRef, JSON.parse(JSON.stringify(config)), { merge: true });
  } catch (err) {
    console.warn('Falha ao salvar config global no Firestore:', err);
  }
};
