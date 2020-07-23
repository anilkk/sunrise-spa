import Vue from 'vue';
import gql from 'graphql-tag';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import cartMixin from '../../../mixins/cartMixin';
import productMixin from '../../../mixins/productMixin';
import BaseMoney from '../../common/BaseMoney/BaseMoney.vue';
import BasePrice from '../../common/BasePrice/MiniCardBasePrice.vue';
import LineItemInfo from '../../common/cartlike/LineItemInfo/LineItemInfo.vue';
import LineItemDeleteForm from '../../cartdetail/LineItemDeleteForm/LineItemDeleteForm.vue';
import MONEY_FRAGMENT from '../../Money.gql';
import { locale } from '../../common/shared';

export default {
  components: {
    LineItemDeleteForm,
    LineItemInfo,
    BaseMoney,
    VuePerfectScrollbar,
    BasePrice,
  },
  mixins: [cartMixin, productMixin],
  data: () => ({
    me: null,
  }),
  computed: {
    show() {
      return this.$store.state.miniCartOpen;
    },
    subtotal() {
      if (this.me) {
        const { currencyCode, fractionDigits } = this.me.activeCart.totalPrice;
        return {
          centAmount: this.me.activeCart.lineItems.reduce((acc, li) => acc + li.totalPrice.centAmount, 0),
          currencyCode,
          fractionDigits,
        };
      }
      return null;
    },
  },
  methods: {
    open() {
      this.$store.dispatch('openMiniCart', 0);
    },
    close() {
      this.$store.dispatch('toggleMiniCart');
    },
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue && !oldValue) {
        Vue.nextTick(() => $('.nav-minicart section').scrollTop(0));
      }
    },
    totalItems() {
      this.$store.dispatch('setCartItems', this.totalItems);
    },
  },
  apollo: {
    me: {
      query: gql`
        query me($locale: Locale!) {
          me {
            activeCart {
              id
              lineItems {
                id
                quantity
                name(locale: $locale)
                productSlug(locale: $locale)
                variant {
                  sku
                  images {
                    url
                  }
                }
                price {
                  value {
                    ...MoneyFields
                  }
                  discounted {
                    value {
                      ...MoneyFields
                    }
                  }
                }
                totalPrice {
                  ...MoneyFields
                }
              }
              totalPrice {
                ...MoneyFields
              }
            }
          }
        }
        ${MONEY_FRAGMENT}`,
      variables() {
        return {
          locale: locale(this),
        };
      },
    },
  },
};
