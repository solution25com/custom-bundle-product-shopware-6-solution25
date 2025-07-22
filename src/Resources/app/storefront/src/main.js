import DropdownPlugin from "./js/dropdown.plugin";
import BundlePriceUpdate from "./js/price-calculate.plugin";
import BundlePricePlugin from './js/bundle-price-plugin';
import stockSwitch from "./js/stock-switch.plugin";
import GroupedPricePlugin from "./js/grouped-price-plugin";
import itemCalc from "./js/total-iteme-calc.plugin";
import addAllCart from "./js/addtocart.plugin";
import StickybuttonPlugin from "./js/stickybutton.plugin";
import PreventDoubleAddPlugin from './js/prevent-double-add.plugin';
import MaxBundleQuantity from './js/bundle-max-quantity.plugin';
import StickyGroupedProductActionPlugin from './js/sticky-grouped-product-action.plugin';
import QuantityTooltipPlugin from './js/quantity-tooltip.plugin';


const PluginManager = window.PluginManager;
PluginManager.register('DropdownPlugin', DropdownPlugin, '[data-dropdown]');
PluginManager.register('BundlePriceUpdate', BundlePriceUpdate, '[data-bundle-price-update]');
PluginManager.register('BundlePricePlugin', BundlePricePlugin, '[data-bundle-price-update-options]');
PluginManager.register('GroupedPricePlugin', GroupedPricePlugin, '[data-grouped-price-update]');
PluginManager.register('stockSwitch', stockSwitch, '[data-bundle-stock-switch]');
PluginManager.register('itemCalc', itemCalc, '[data-item-calc]');
PluginManager.register('addAllCart', addAllCart, '[data-add-all-cart]');
PluginManager.register('StickybuttonPlugin', StickybuttonPlugin, '[sticky-button]');
PluginManager.register('PreventDoubleAddPlugin', PreventDoubleAddPlugin, '[data-prevent-double-add]');
PluginManager.register('MaxBundleQuantity', MaxBundleQuantity, '[data-max-quantity]');
PluginManager.register('StickyGroupedProductActionPlugin', StickyGroupedProductActionPlugin, '[data-sticky-grouped-product]');
PluginManager.register('QuantityTooltipPlugin', QuantityTooltipPlugin, '[data-quantity-tooltip]');