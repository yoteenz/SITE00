# Shopify Diagnostic Adapter

## Behavior surfaces (taxonomy)

THEME · APP · DISCOUNT_CONFIGURATION · SHOPIFY_FUNCTION · CUSTOM_APP · CART_LOGIC · CHECKOUT_LOGIC · PRODUCT_VARIANT_CONFIGURATION · METAFIELD_METAOBJECT · UNKNOWN

## Implemented (this sprint)

- Access requirement templates (`shopifyAccessRequirements()`)
- Platform selection + case intake storing Shopify context
- QA matrix **template** for promotion/cart cases (`SHOPIFY_PROMOTION_QA_TEMPLATE`)

## Modeled, not connected

- Automated Admin API / collaborator OAuth
- Theme file inspection agents
- Live discount function analysis

## Founding merchant scenario

Free-sample / minimum-purchase promotion logic: compiler maps to DIAGNOSE → REPAIR work order; findings must identify enforcement layer (theme vs app vs discount config) before approved fix.
