# TRACE Product Identity Infrastructure
Version: 1.0

## Description
Central registry, visual encoding engine, and decentralized verification logs for secure product authentication.

## Layers
- **entry**: Entry Points — User-Facing Applications (y: 150, h: 420)
- **services**: Core Services — Processing & Verification (y: 640, h: 480)
- **infra**: Infrastructure — Data, Analytics & Identity (y: 1190, h: 450)
- **future**: Roadmap — Future Vision (y: 1710, h: 380)

## Trust Boundary
- **Title**: TRUST BOUNDARY (SECURE BACKEND)
- **Note**: Decryption, persistence & intelligence execute inside this zone
- **Geometry**: x: 1000, y: 670, w: 1120, h: 950

## Nodes

### brand (Entry Point)
* **Title:** Brand Portal
* **Icon:** 🏢
* **Color:** hsl(260,70%,65%)
* **x:** 450
* **y:** 240
* **Description:** Enterprise dashboard — brands register products, generate TRACE Marks, manage catalog and teams.
* **Capabilities:** Create Product, Generate Single/Bulk TRACE Marks, Download Print Assets, Product Lifecycle, Analytics Dashboard
* **Management:** Product Catalog, Batch Management, Manufacturer Settings, Team Management

### consumer (Entry Point)
* **Title:** Consumer Verification
* **Icon:** 📱
* **Color:** hsl(210,85%,62%)
* **x:** 1550
* **y:** 240
* **Description:** Consumer-facing scan experience — verify any product's authenticity instantly.
* **Channels:** PWA (Web App), Future Native App, Paytm Integration, PhonePe Integration
* **Output:** Scan History, Verification Result, Product Details, Authenticity Certificate

### engine (Service)
* **Title:** TRACE Engine
* **Icon:** ⚙️
* **Color:** hsl(220,80%,62%)
* **x:** 400
* **y:** 740
* **Description:** Proprietary visual language — encodes and decodes TRACE Marks. Does NOT decrypt payloads.
* **Core Functions:** TRACE Mark Generation, TRACE Mark Decoding, Photo → Vision Processing, Error Correction, Version Control (v1 → v2 → v3)
* **Flow:** Photo → Vision Layer* → Decode → Encrypted Payload

### backend (Service)
* **Title:** Verification Backend
* **Icon:** 🖥️
* **Color:** hsl(200,80%,58%)
* **x:** 1350
* **y:** 720
* **Description:** Source of truth — the ONLY system that decrypts payloads and performs verification.
* **Responsibilities:** Receive Encrypted Payload, Decrypt via Secure Keys, Lookup Product in Database, Return Verification Result, Log Scan to Analytics

### activation (Service)
* **Title:** Activation System
* **Icon:** 🔑
* **Color:** hsl(32,85%,58%)
* **x:** 2100
* **y:** 740
* **Description:** Activates manufactured products before they ship. Multiple activation methods supported.
* **Methods:** Factory Scanner, Webcam Activation, Mobile Activation App, Batch Activation, Individual Activation
* **Flow:** Generate → Print → Activate* → Ship

### database (Infrastructure)
* **Title:** Database
* **Icon:** 🗄️
* **Color:** hsl(170,70%,50%)
* **x:** 1100
* **y:** 1290
* **Description:** Central data store — persists registry records, telemetry logs, and digital twins.
* **Identity Registry Schema:** Product Digital Twins, Manufacturer Registry, Batch & Activation Logs, Scan & Verification History
* **Infrastructure Data:** Metadata Event Logs, User & Team Credentials

### analytics (Infrastructure)
* **Title:** Analytics Engine
* **Icon:** 📊
* **Color:** hsl(48,82%,55%)
* **x:** 1750
* **y:** 1290
* **Description:** Behavioral intelligence — detects counterfeiting patterns, generates risk scores.
* **Tracking:** Scan Count & Velocity, Scan Geo-Location, Device Fingerprint, Scan Timeline
* **Outputs:** Risk Score Calculation, Suspicious Activity Alerts, Counterfeit Probability, Regional Trends

### future (Future)
* **Title:** Future Security Layers
* **Icon:** 🔮
* **Color:** hsl(180,65%,52%)
* **x:** 650
* **y:** 1810
* **Description:** Potential future systems extending TRACE's defense capabilities.
* **Capabilities:** Scratch Codes, Ownership Transfer, RFID / NFC, Microprinting, Digital Signatures, Blockchain, Enterprise APIs

### vision (Future)
* **Title:** Long-Term Vision
* **Icon:** 🚀
* **Color:** hsl(145,65%,52%)
* **x:** 1450
* **y:** 1810
* **Description:** TRACE evolves beyond marks into industry-scale infrastructure.
* **TRACE is NOT:** ~A QR code, ~A barcode
* **TRACE IS:** *Product Identity Infrastructure, *Product Verification Infrastructure, *Product Intelligence Infrastructure, *Anti-Counterfeit Ecosystem

## Connections
| From | To | Interaction | Type |
|---|---|---|---|
| brand | engine | Generate Mark | request |
| brand | backend | Register Product | request |
| consumer | engine | Photo → Decode | request |
| consumer | backend | Verification Request | request |
| activation | backend | Activate Product | request |
| backend | analytics | Log Scan Event | request |
| brand | database | CRUD Products | data |
| backend | database | Product Lookup | data |
| activation | database | Update Status | data |
| analytics | database | Read/Write Scans | data |
| analytics | backend | Anomalies / Risk Score | data |
| future | backend | Integrates | future |
| vision | future | Roadmap Alignment | future |
| backend | analytics | Future: Async Event Broker | future |

## Flows

### consumer-verify (Consumer Verification)
*What happens when someone scans a product?*
- **Color:** hsl(210,85%,62%)

1. **consumer** [Consumer scans a product]: Consumer opens the TRACE PWA, points their camera at the product, and captures a photo of the TRACE Mark.
   * Data: 📸 Photo of TRACE Mark
2. **engine** [TRACE Engine decodes the mark]: Photo is processed through the Vision Layer. The TRACE Mark is identified, decoded, and an encrypted payload is extracted. The Engine does NOT decrypt — it only reads the visual encoding.
   * Data: 🔒 Encrypted Payload (opaque to Engine)
3. **backend** [Backend decrypts payload & validates]: Backend decrypts the payload, verifies authenticity, and fetches the product data.
   * Data: 🔑 Decrypted Product ID & Identity Status
4. **database** [Database Lookup]: Backend queries the central database for the product twin status and details.
   * Data: 🗄️ Twin State
5. **backend** [Evaluate scan data]: Backend receives data and requests counterfeit check from analytics.
   * Data: 📦 Twin State payload
6. **analytics** [Counterfeit Check]: Analytics evaluates location, scan count, and speed to generate risk scores.
   * Data: 📊 Risk Score & Geo Anomalies
7. **backend** [Format response]: Backend returns the final validation status and product details back to the consumer.
   * Data: ✅ Success or Warning Result
8. **consumer** [Show Verification screen]: Consumer PWA displays authenticity confirmation, batch history, and product digital twin.
   * Data: 📱 Verified screen

### product-generation (Product Generation)
*How does a brand create TRACE-protected products?*
- **Color:** hsl(260,70%,65%)

1. **brand** [Brand creates a product entry]: Through the Brand Portal, the manufacturer registers a new product. This initializes the metadata for the product entry.
   * Data: 📝 Product Details & Batch Specs
2. **engine** [TRACE Engine encrypts & encodes mark]: Unique TRACE IDs are encrypted using secure cryptographic keys and encoded into the proprietary visual TRACE Mark. The raw ID is never stored in the visual pattern.
   * Data: 🔒 Encrypted Payload → Visual TRACE Mark Assets
3. **database** [Product registered in database]: The product record is persisted in the database registry as 'Generated', mapping the unique TRACE ID to the manufacturer and batch.
   * Data: 💾 TRACE ID assigned → Database Registry
4. **activation** [Marks queued for Activation]: The generated TRACE Marks are sent to factory printing queues and the Activation System, ready to be printed and scanned during manufacturing.
   * Data: 📋 Mark print queue initialized

### activation (Product Activation)
*How are manufactured products activated into the ecosystem?*
- **Color:** hsl(32,85%,58%)

1. **brand** [Brand initiates activation]: After printing TRACE Marks on product packaging, the brand triggers the activation workflow for the manufactured batch.
   * Data: 📋 Batch of products ready for activation
2. **activation** [Products scanned at factory]: Using factory scanners or mobile apps, the physical TRACE Marks are scanned. This proves the code was printed and applied to a physical product.
   * Data: 📷 Factory scan of TRACE Mark
3. **backend** [Backend validates activation]: The Verification Backend validates the request inside the secure boundary, checking cryptographic integrity and ensuring the ID has not been previously activated.
   * Data: ✅ Validation check completed
4. **database** [Registry updated with active identity]: The product's status is updated to 'Active' in the Database's Identity Registry. Timestamp, batch details, and activation metadata are logged to complete its digital twin.
   * Data: 💾 Status: Generated → Active (Identity Registry Updated)

### counterfeit-detection (Counterfeit Detection)
*How does TRACE detect counterfeit activity?*
- **Color:** hsl(0,72%,62%)

1. **analytics** [Behavioral patterns analyzed]: The Analytics Engine continuously monitors scan patterns across all products, building behavioral profiles and scan baselines.
   * Data: 📊 Baseline patterns for all products
2. **database** [Historical scan data queried]: The engine queries the database for historical logs, tracking location clusters and scan velocity trends.
   * Data: 🔍 Historical Scan Data Loaded
3. **analytics** [Anomaly detected & risk scored]: The Analytics Engine detects high-risk anomaly (e.g. Mumbai & Delhi scans within 30 minutes). It calculates a critical risk score based on geo-velocity heuristics.
   * Data: 🔴 Risk Score: 94/100 (High Counterfeit Probability)
4. **backend** [Backend routes threat trigger]: The Verification Backend receives the high-risk alert event from Analytics and triggers immediate threat mitigation rules & notification webhooks.
   * Data: ⚠️ Threat Alert Broadcast
5. **brand** [Brand alerted via portal]: The brand is instantly notified via the Brand Portal dashboard, showing suspicious locations, timestamps, and product batch ID.
   * Data: 🚨 Alert: Suspected counterfeit activity detected

### analytics-flow (Analytics Pipeline)
*How does scan data become intelligence?*
- **Color:** hsl(48,82%,55%)

1. **consumer** [Consumer scans product]: Every consumer scan generates a rich metadata event — not just the scan result, but location, device info, timestamp, and behavioral signals.
   * Data: 📱 Scan event with metadata
2. **backend** [Backend processes verification]: While processing the verification request, the backend packages scan metadata into an analytics event for downstream processing.
   * Data: 📦 Scan metadata packaged
3. **analytics** [Analytics Engine ingests event]: The scan event is ingested by the Analytics Engine — enriched with geo-data, device classification, and time-series context.
   * Data: 📊 Event enriched with context
4. **database** [Event stored and indexed]: The enriched event is stored in the scan event log and indexed for real-time querying. Historical patterns are updated.
   * Data: 💾 Indexed in scan event log
5. **analytics** [Intelligence outputs generated]: Aggregated data produces actionable outputs — risk scores per product, regional trends, scan velocity reports, and suspicious activity alerts.
   * Data: 📈 Risk Scores, Trends, Alerts → Brand Dashboard
6. **brand** [Insights available on dashboard]: Manufacturers see real-time analytics on the Brand Portal — scan maps, product activity timelines, counterfeit probability heat maps, and regional trends.
   * Data: 📊 Dashboard: Maps, Timelines, Heat Maps

### registration-flow (Product Registration)
- **Color:** hsl(310,65%,62%)

1. **brand** [Brand registers product details]: The manufacturer inputs product metadata, SKU details, and batch size through the Brand Portal.
   * Data: 📝 Product Profile & Batch Metadata
2. **backend** [Backend validates registration]: The Verification Backend verifies the request credentials, checks for naming collisions, and authorizes the registration.
   * Data: 🔑 Verification Backend Authorization
3. **database** [Identity registry record written]: The Database creates the authoritative registry entries, generating a unique TRACE ID mapping and establishing the initial digital twin status.
   * Data: 💾 TRACE ID Assigned & Status = Registered
4. **brand** [Product ready for mark generation]: The Brand Portal displays the successful registration. The product batch is now cleared for generating visual TRACE Marks.
   * Data: ✅ Status: Registered → Ready for Mark Generation

### ownership-flow (Ownership Flow)
- **Color:** hsl(310,65%,62%)

1. **consumer** [Consumer claims ownership]: Upon successful verification, the consumer opts to claim the product via the PWA, binding the physical unit to their profile.
   * Data: 👤 Consumer ID & TRACE ID Pairing Request
2. **backend** [Backend validates claim]: The Verification Backend validates the request—confirming the product's active status and ensuring it is not already claimed.
   * Data: 🔒 Ownership Eligibility Verified
3. **database** [Ownership saved to registry]: The Database updates the product registry schema, writing the consumer ownership mapping to complete the lifecycle record.
   * Data: 💾 Database Registry Status: Owned
4. **future** [Future: Secure peer-to-peer transfer]: Future Roadmap capability: cryptographic transfer protocols enabling secondary market proof-of-ownership updates.
   * Data: 🔮 Future Secure P2P Ownership Exchange
