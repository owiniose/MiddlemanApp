import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { HomeStackParamList, RootStackParamList } from '../types/navigation';
import { useCart } from '../context/CartContext';
import { OptionGroup, SelectedOption } from '../context/CartContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'VendorDetail'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  image?: string;
  available: boolean;
  options?: OptionGroup[];
};

type VendorData = {
  deliveryTime?: string;
  minOrder?: string;
  image?: string;
  open?: boolean;
  rating?: string;
};

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

// ── Options Modal ────────────────────────────────────────────────────────────

type OptionsModalProps = {
  item: MenuItem;
  vendorId: string;
  vendorName: string;
  onClose: () => void;
  onAdd: (item: Omit<import('../context/CartContext').CartItem, 'qty'>) => void;
};

function OptionsModal({ item, vendorId, vendorName, onClose, onAdd }: OptionsModalProps) {
  // selections[groupIndex] = array of selected choice indices
  const [selections, setSelections] = useState<number[][]>(
    (item.options ?? []).map(() => []),
  );

  const groups = item.options ?? [];

  const toggleChoice = (gi: number, ci: number) => {
    setSelections((prev) => {
      const next = [...prev];
      if (groups[gi].multiSelect) {
        const already = next[gi].includes(ci);
        next[gi] = already ? next[gi].filter((x) => x !== ci) : [...next[gi], ci];
      } else {
        next[gi] = next[gi][0] === ci ? [] : [ci];
      }
      return next;
    });
  };

  const allRequiredFilled = groups.every((g, gi) => !g.required || selections[gi].length > 0);

  const extraTotal = groups.reduce((sum, g, gi) =>
    sum + selections[gi].reduce((s, ci) => s + g.choices[ci].price, 0), 0,
  );

  const handleAdd = () => {
    const selectedOptions: SelectedOption[] = groups
      .map((g, gi) => ({
        groupName: g.name,
        choices: selections[gi].map((ci) => ({ name: g.choices[ci].name, price: g.choices[ci].price })),
      }))
      .filter((g) => g.choices.length > 0);

    const cartKey = item.id + JSON.stringify(selectedOptions);

    onAdd({
      id: item.id,
      cartKey,
      name: item.name,
      description: item.description,
      price: item.price,
      vendorId,
      vendorName,
      image: item.image,
      selectedOptions,
    });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.sheet}>
          <View style={mStyles.handle} />

          <View style={mStyles.header}>
            <View style={{ flex: 1 }}>
              <Text style={mStyles.itemName}>{item.name}</Text>
              <Text style={mStyles.basePrice}>Base: ₦{item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={mStyles.closeBtn}>
              <Text style={mStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={mStyles.body} showsVerticalScrollIndicator={false}>
            {groups.map((group, gi) => (
              <View key={gi} style={mStyles.group}>
                <View style={mStyles.groupHeader}>
                  <Text style={mStyles.groupName}>{group.name}</Text>
                  <View style={[mStyles.badge, group.required ? mStyles.badgeRequired : mStyles.badgeOptional]}>
                    <Text style={[mStyles.badgeText, group.required ? mStyles.badgeRequiredText : mStyles.badgeOptionalText]}>
                      {group.required ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                  {group.multiSelect && (
                    <View style={mStyles.badgeMulti}>
                      <Text style={mStyles.badgeMultiText}>Pick many</Text>
                    </View>
                  )}
                </View>

                {group.choices.map((choice, ci) => {
                  const selected = selections[gi].includes(ci);
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[mStyles.choiceRow, selected && mStyles.choiceRowSelected]}
                      onPress={() => toggleChoice(gi, ci)}
                      activeOpacity={0.7}
                    >
                      <View style={[mStyles.selector, selected && mStyles.selectorSelected]}>
                        {selected && <View style={mStyles.selectorDot} />}
                      </View>
                      <Text style={[mStyles.choiceName, selected && mStyles.choiceNameSelected]}>
                        {choice.name}
                      </Text>
                      <Text style={[mStyles.choicePrice, selected && mStyles.choicePriceSelected]}>
                        {choice.price === 0 ? 'Included' : `+₦${choice.price.toLocaleString()}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={mStyles.footer}>
            <View style={mStyles.totalRow}>
              <Text style={mStyles.totalLabel}>Total</Text>
              <Text style={mStyles.totalValue}>₦{(item.price + extraTotal).toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={[mStyles.addBtn, !allRequiredFilled && mStyles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!allRequiredFilled}
            >
              <Text style={mStyles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function VendorDetail({ route }: Props) {
  const { id, title, rating } = route.params;
  const { addItem, removeItem, items, count, total } = useCart();
  const rootNav = useNavigation<RootNav>();

  const [menuSections, setMenuSections] = useState<{ section: string; items: MenuItem[] }[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({});
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [optionsItem, setOptionsItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, 'vendors', id)),
      getDocs(query(collection(db, 'menuItems'), where('vendorId', '==', id))),
    ]).then(([vendorSnap, menuSnap]) => {
      if (vendorSnap.exists()) setVendorData(vendorSnap.data() as VendorData);

      const allItems = menuSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
      const grouped: Record<string, MenuItem[]> = {};
      allItems.forEach((item) => {
        if (!grouped[item.section]) grouped[item.section] = [];
        grouped[item.section].push(item);
      });
      setMenuSections(Object.entries(grouped).map(([section, items]) => ({ section, items })));
      setLoading(false);
    });

    getDocs(query(
      collection(db, 'reviews'),
      where('vendorId', '==', id),
    )).then((snap) => {
      const fetched = snap.docs.map((d) => ({
        id: d.id,
        customerName: d.data().customerName,
        rating: d.data().rating,
        comment: d.data().comment,
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      }));
      fetched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReviews(fetched);
      setReviewsLoading(false);
    }).catch(() => setReviewsLoading(false));
  }, [id]);

  const getQty = (itemId: string) =>
    items.filter((i) => i.id === itemId).reduce((s, i) => s + i.qty, 0);

  const liveRating = vendorData.rating ?? rating;
  const isClosed = vendorData.open === false;

  const handleAddPress = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setOptionsItem(item);
    } else {
      addItem({
        id: item.id,
        cartKey: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        vendorId: id,
        vendorName: title,
        image: item.image,
      });
    }
  };

  // For items with options, remove the last added variant
  const handleRemovePress = (item: MenuItem) => {
    const cartItems = items.filter((i) => i.id === item.id);
    if (cartItems.length === 0) return;
    removeItem(cartItems[cartItems.length - 1].cartKey);
  };

  return (
    <View style={styles.container}>
      {vendorData.image
        ? <Image source={{ uri: vendorData.image }} style={styles.hero} />
        : <View style={[styles.hero, styles.heroPlaceholder]} />
      }

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.vendorName}>{title}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {liveRating}</Text>
            </View>
            {vendorData.deliveryTime && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🕐 {vendorData.deliveryTime}</Text>
              </View>
            )}
            {vendorData.minOrder && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Min. {vendorData.minOrder}</Text>
              </View>
            )}
            {reviews.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>💬 {reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>

        {isClosed && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedBannerText}>🔴 This store is currently closed and not accepting orders</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.menuLoader}>
            <ActivityIndicator size="small" color="#0f766e" />
          </View>
        ) : menuSections.length === 0 ? (
          <View style={styles.emptyMenu}>
            <Text style={styles.emptyMenuText}>No menu items added yet</Text>
          </View>
        ) : (
          menuSections.map((sec) => (
            <View key={sec.section} style={styles.section}>
              <Text style={styles.sectionTitle}>{sec.section}</Text>
              {sec.items.map((item) => {
                const qty = getQty(item.id);
                const hasOptions = item.options && item.options.length > 0;
                return (
                  <View key={item.id} style={styles.menuItem}>
                    {item.image
                      ? <Image source={{ uri: item.image }} style={styles.menuImage} />
                      : <View style={[styles.menuImage, styles.menuImagePlaceholder]} />
                    }
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.description}</Text>
                      <View style={styles.menuPriceRow}>
                        <Text style={styles.menuPrice}>₦{item.price.toLocaleString()}</Text>
                        {hasOptions && (
                          <View style={styles.customizableBadge}>
                            <Text style={styles.customizableBadgeText}>Customisable</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.qtyControl}>
                      {qty > 0 && !isClosed ? (
                        <>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleRemovePress(item)}>
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyCount}>{qty}</Text>
                        </>
                      ) : null}
                      <TouchableOpacity
                        style={[styles.addBtn, isClosed && styles.addBtnDisabled]}
                        disabled={isClosed}
                        onPress={() => handleAddPress(item)}
                      >
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* Reviews section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          {reviewsLoading ? (
            <ActivityIndicator size="small" color="#0f766e" style={{ marginTop: 12 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet — be the first!</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.customerName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.customerName}</Text>
                    <View style={styles.reviewStars}>
                      {[1,2,3,4,5].map((s) => (
                        <Text key={s} style={[styles.reviewStar, s <= r.rating ? styles.starFilled : styles.starEmpty]}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {r.createdAt.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {count > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.cartBarWrap}>
          <TouchableOpacity style={styles.cartBar} onPress={() => rootNav.navigate('Cart')}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{count}</Text>
            </View>
            <Text style={styles.cartBarLabel}>View Cart</Text>
            <Text style={styles.cartBarTotal}>₦{total.toLocaleString()}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {optionsItem && (
        <OptionsModal
          item={optionsItem}
          vendorId={id}
          vendorName={title}
          onClose={() => setOptionsItem(null)}
          onAdd={addItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 240, backgroundColor: '#d1d5db', width: '100%' },
  heroPlaceholder: { backgroundColor: '#e5e7eb' },
  scroll: { paddingBottom: 16 },

  infoCard: { padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  vendorName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  menuLoader: { padding: 40, alignItems: 'center' },
  emptyMenu: { padding: 40, alignItems: 'center' },
  emptyMenuText: { color: '#9ca3af', fontSize: 14 },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111827' },

  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  menuImage: { width: 72, height: 72, borderRadius: 10, marginRight: 12 },
  menuImagePlaceholder: { backgroundColor: '#f3f4f6' },
  menuInfo: { flex: 1 },
  menuName: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  menuDesc: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  menuPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  menuPrice: { fontWeight: '700', color: '#0f766e' },
  customizableBadge: { backgroundColor: '#f0fdf4', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  customizableBadgeText: { fontSize: 10, color: '#0f766e', fontWeight: '600' },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#0f766e', fontSize: 16, lineHeight: 20 },
  qtyCount: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: '#d1d5db' },
  addBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },
  closedBanner: { backgroundColor: '#fef2f2', borderRadius: 10, marginHorizontal: 16, marginTop: 12, padding: 12 },
  closedBannerText: { color: '#dc2626', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  reviewsSection: { paddingHorizontal: 16, paddingTop: 24 },
  reviewsTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  noReviews: { color: '#9ca3af', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  reviewCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 10, gap: 6 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewStar: { fontSize: 13 },
  starFilled: { color: '#f59e0b' },
  starEmpty: { color: '#d1d5db' },
  reviewDate: { fontSize: 11, color: '#9ca3af' },
  reviewComment: { fontSize: 13, color: '#374151', lineHeight: 18, paddingLeft: 46 },

  cartBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 12 },
  cartBar: { backgroundColor: '#0f766e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cartCountBadge: { backgroundColor: '#0d9488', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cartBarLabel: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  cartBarTotal: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginTop: 12, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  basePrice: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  closeBtnText: { color: '#374151', fontSize: 14, fontWeight: '700' },

  body: { paddingHorizontal: 20 },
  group: { paddingTop: 18 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeRequired: { backgroundColor: '#fef3c7' },
  badgeOptional: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeRequiredText: { color: '#92400e' },
  badgeOptionalText: { color: '#6b7280' },
  badgeMulti: { backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeMultiText: { fontSize: 11, fontWeight: '600', color: '#1d4ed8' },

  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: 'transparent' },
  choiceRowSelected: { backgroundColor: '#f0fdf4', borderColor: '#0f766e' },
  selector: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  selectorSelected: { borderColor: '#0f766e' },
  selectorDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0f766e' },
  choiceName: { flex: 1, fontSize: 14, color: '#374151' },
  choiceNameSelected: { color: '#111827', fontWeight: '600' },
  choicePrice: { fontSize: 13, color: '#9ca3af' },
  choicePriceSelected: { color: '#0f766e', fontWeight: '600' },

  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, borderTopWidth: 1, borderColor: '#f3f4f6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#0f766e' },
  addBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#d1d5db' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
