# Questions to Ask Your Client for Dashboard Integration

## 1. Data Source & API Access

### API Endpoints
- **Q1:** Do you have a REST API that provides site/device data?
  - If yes: What is the base URL? (e.g., `https://api.yourcompany.com/v1`)
  - If no: Do you have a database we can connect to? What type? (PostgreSQL, MySQL, MongoDB, etc.)

- **Q2:** What authentication method does your API use?
  - API Key? (Where should it be stored?)
  - OAuth2? (Client ID/Secret needed?)
  - Basic Auth? (Username/Password)
  - JWT Token? (How to obtain/refresh?)

- **Q3:** What are the specific API endpoints for:
  - Getting all sites/devices: `GET /api/sites` or `GET /api/devices`?
  - Getting a single site by ID: `GET /api/sites/{id}`?
  - Getting site hierarchy/tree: `GET /api/sites/tree`?
  - Getting real-time alarm data: `GET /api/alarms` or WebSocket?

### Data Structure
- **Q4:** What fields are available in your site/device data?
  - Required fields: `id`, `name`, `ipAddress`, `location` (lat/lng), `state`, `country`, `maxAlarmSeverity`
  - Additional fields: `status`, `lastSeen`, `deviceType`, `region`, `parentId`, etc.
  - Can you provide a sample JSON response?

- **Q5:** How is the hierarchy structured?
  - Is it a flat list with `parentId`? (e.g., `{id: "site1", name: "Site 1", parentId: "region1"}`)
  - Or nested JSON? (e.g., `{name: "Region", children: [{name: "Site 1"}]}`)
  - What are the hierarchy levels? (e.g., Region > State > City > Site > Device)

## 2. Real-Time Data Updates

- **Q6:** How often does the data change?
  - Do we need real-time updates? (WebSocket/SSE)
  - Or is polling acceptable? (Every 30 seconds, 1 minute, 5 minutes?)

- **Q7:** What triggers data changes?
  - Alarm severity changes?
  - New sites added?
  - Site status changes?
  - IP address changes?

- **Q8:** Should the dashboard auto-refresh?
  - If yes, what interval? (30s, 1min, 5min)
  - Or should it only refresh on user action?

## 3. Location & Map Data

- **Q9:** Do you have latitude/longitude coordinates for each site?
  - If yes: Which fields contain them? (`latitude`/`longitude`, `lat`/`lng`, `location.coordinates`?)
  - If no: Do you have addresses? (We can geocode them)
  - Or do you have city/state only? (We can use approximate coordinates)

- **Q10:** What map provider do you prefer?
  - Google Maps? (Requires API key)
  - OpenStreetMap/Leaflet? (Free, no key needed)
  - Mapbox? (Requires API key)
  - Other?

- **Q11:** Do you have any map restrictions?
  - Specific regions to show?
  - Zoom level limits?
  - Custom map styles?

## 4. Alarm Severity & Status

- **Q12:** What are your alarm severity levels?
  - What values does `maxAlarmSeverity` use? (0-5, 1-4, Critical/Major/Minor/Warning?)
  - What does each level mean in your system?

- **Q13:** How is alarm severity calculated?
  - Is it the highest severity alarm at that site?
  - Or an aggregate of all devices at that site?
  - Does it roll up from child sites to parent groups?

- **Q14:** Do you have additional status fields?
  - Online/Offline status?
  - Maintenance mode?
  - Other operational states?

## 5. Filtering & Selection

- **Q15:** What filtering capabilities do you need?
  - Filter by region/state/country?
  - Filter by alarm severity?
  - Filter by device type?
  - Search by name/IP address?

- **Q16:** When a user selects a site from the dropdown:
  - Should it filter other panels on the dashboard?
  - Should it show detailed information in a popup/modal?
  - Should it highlight the site on the map?
  - Should it update alarm counts?

## 6. Performance & Scale

- **Q17:** How many sites/devices do you have?
  - < 100 sites? (Simple implementation)
  - 100-1000 sites? (Need pagination/virtualization)
  - > 1000 sites? (Need advanced optimization)

- **Q18:** Are there any rate limits on your API?
  - Requests per minute/hour?
  - Concurrent connection limits?

## 7. Grafana Integration

- **Q19:** Will this run in Grafana Cloud or self-hosted Grafana?
  - If self-hosted: What version? (Need >= 10.4.0)
  - If cloud: Any restrictions on external API calls?

- **Q20:** Do you want to use Grafana Data Sources?
  - Should we create a custom data source plugin?
  - Or use HTTP API data source?
  - Or use existing data source (Prometheus, InfluxDB, etc.)?

## 8. Security & Permissions

- **Q21:** Are there user permissions/roles?
  - Can all users see all sites?
  - Or should users only see sites they have access to?
  - How do we determine user permissions? (API call, Grafana roles?)

- **Q22:** Are there any CORS restrictions?
  - Can Grafana make API calls from the browser?
  - Or do we need a proxy/backend service?

## 9. Customization

- **Q23:** Any branding requirements?
  - Custom colors?
  - Company logo?
  - Custom icons for alarm severities?

- **Q24:** Any specific UI/UX requirements?
  - Preferred layout?
  - Required features?
  - Features to avoid?

## 10. Testing & Deployment

- **Q25:** Do you have a test/staging environment?
  - Test API endpoint?
  - Test credentials?
  - Sample data we can use?

- **Q26:** What is your deployment process?
  - How will the plugin be installed?
  - Who will maintain it?
  - Update frequency?

---

## Summary Template for Client

**Please provide:**
1. ✅ API Base URL: `_________________`
2. ✅ Authentication: `[ ] API Key  [ ] OAuth  [ ] Basic Auth  [ ] JWT`
3. ✅ Endpoint for sites: `GET _________________`
4. ✅ Sample JSON response: `[Attach file]`
5. ✅ Hierarchy format: `[ ] Flat with parentId  [ ] Nested JSON`
6. ✅ Location data: `[ ] Lat/Lng  [ ] Address  [ ] City/State only`
7. ✅ Update frequency: `[ ] Real-time  [ ] Polling every _____ seconds`
8. ✅ Number of sites: `_____`
9. ✅ Map provider preference: `_________________`
10. ✅ Test environment available: `[ ] Yes  [ ] No`

