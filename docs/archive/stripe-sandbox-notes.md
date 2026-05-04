### Product Catalog
- Founder Circle Membership
- RHS Details Edit
-- Marketing feature list
-- Description
- Question: Do I need to use the Metadata field?
- Question: Do I need to use the Features field?

Based on the documentation, here's how Metadata and Features are used in the product catalog:

### Metadata
Metadata is a set of key-value pairs that you can attach to a product for your own internal use. It's not displayed to customers. You can use metadata to:

- Store custom information about the product
- Organize and query products
- Track internal identifiers or references
- Add any arbitrary data you need for your own systems
- Pass custom business attributes through your integration

Metadata is not visible to customers and is only returned when you use your secret API key. You can store up to 50 key-value pairs, with keys up to 40 characters and values up to 500 characters.

For your Discord invite link example, you could store it in metadata (for example, discord_invite: "https://discord.gg/...") for your own reference, but customers wouldn't see it.

### Features
Features represent specific functions or abilities that customers can access when they subscribe to a product. Features work with Stripe's Entitlements system to control access to your service. When you attach features to products:

Customers who subscribe to a product automatically receive entitlements to all features attached to that product
You can use these entitlements to gate access to specific functionality in your application
The same feature can be attached to multiple products

*For subscription tiers*
Yes, features are very useful for subscription tiers. Here's an example:

If you wanted to create Basic and Premium tiers, you could:

1. Create features such as `basic_access`, `premium_support`, and `advanced_reporting`.
2. Attach only `basic_access` to your Basic product.
3. Attach `basic_access`, `premium_support`, and `advanced_reporting` to your Premium product.
4. When customers subscribe, Stripe automatically creates entitlements for them based on the features attached to the product.
5. Your application checks a customer’s entitlements to determine which features to enable.

For your Discord link: Features are not designed to store URLs. Instead, you could create a feature called `community_access`, attach it to your product, and grant Discord access to customers who have that entitlement. The actual Discord link should be stored in your application or within the product's metadata.
