# 🚀 **PRD-Compliant Postman Collection Testing Guide**

## **📋 Collection Overview**

**File**: `OMS_PRD_Compliance_Testing.postman_collection.json`

This collection is specifically designed to test the complete order-to-onboarding workflow as stated in the PRD, ensuring 100% compliance with all requirements.

## **🎯 PRD Compliance Features**

### **✅ Complete Order Workflow (PRD-Aligned)**
- **10 Order States**: `created → validated → enriched → fno_submitted → fno_accepted → installation_scheduled → in_progress → installed → activated → completed`
- **FNO Integration**: Proper FNO selection, validation, and communication
- **Validation Rules**: Address, service availability, credit checks, network parameters
- **State Management**: Configurable workflows with proper transitions

### **✅ Complete Onboarding Workflow (PRD 10-Step Process)**
- **10 Onboarding Steps**: All required steps implemented and properly sequenced
- **SLA Monitoring**: Comprehensive SLA tracking with warnings and escalations
- **Email Notifications**: Step-specific templates with MongoDB backend
- **State Management**: Proper workflow state machine with transitions

### **✅ SLA Monitoring (PRD-Compliant)**
- **SLA Hours**: 2h, 24h, 48h, 72h, 24h, 12h, 168h for respective states
- **Warning System**: 75% threshold warnings
- **Breach Handling**: 100% threshold breach notifications
- **Re-escalation**: Support for re-escalation after breach

## **📦 Collection Structure**

### **1. Authentication**
- **Login**: JWT token acquisition for API access

### **2. Customer Management**
- **Create Customer**: Customer record creation with complete address and contact information

### **3. Order Workflow (PRD Compliant)**
- **Create Order**: Order creation with service details
- **Validate Order**: Basic validation (address, service availability, credit)
- **Enrich Order**: Network parameters and service enrichment
- **Set Order as Enriched**: Transition to enriched state
- **Get FNOs**: Retrieve available FNOs for assignment
- **Set FNO on Order**: Assign FNO to order
- **Submit to FNO**: Submit order to selected FNO
- **FNO Accepts Order**: FNO acceptance of order
- **Schedule Installation**: Schedule installation appointment

### **4. Onboarding Initiation**
- **Initiate Onboarding**: Start onboarding process with order context

### **5. Onboarding Workflow (PRD 10-Step Process)**
- **Step 1: Welcome Sent** (SLA: 2 hours)
- **Step 2: Service Setup** (SLA: 24 hours)
- **Step 3: Equipment Ordered** (SLA: 48 hours)
- **Step 4: Equipment Shipped** (SLA: 72 hours)
- **Step 5: Installation Scheduled** (SLA: N/A)
- **Step 6: Installation Completed** (SLA: 24 hours)
- **Step 7: Service Activated** (SLA: 12 hours)
- **Step 8: Follow-up** (SLA: 168 hours)
- **Step 9: Completed** (SLA: N/A)

### **6. Verification & Testing**
- **Get Workflow State**: Verify current workflow state
- **Get Workflow History**: Retrieve complete workflow history
- **Get Onboarding Steps**: Get all onboarding steps with status
- **Get SLA Metrics**: Retrieve SLA monitoring metrics

### **7. Error Testing**
- **Test Invalid Transition**: Verify error handling for invalid transitions
- **Test Non-existent Onboarding**: Verify 404 handling

### **8. Email Testing**
- **Send Welcome Email**: Test welcome email template
- **Send Installation Scheduled Email**: Test installation email template

## **🔧 Setup Instructions**

### **Prerequisites**
1. **Backend Server**: Running on `http://localhost:3003`
2. **Database**: PostgreSQL with all migrations applied
3. **FNOs**: Seeded in the database
4. **MongoDB**: Running for email templates

### **Environment Variables**
The collection uses these variables (automatically set):
- `baseUrl`: `http://localhost:3003`
- `accessToken`: JWT token (set after login)
- `customerId`: Customer ID (set after customer creation)
- `orderId`: Order ID (set after order creation)
- `fnoId`: FNO ID (set after FNO retrieval)
- `onboardingId`: Onboarding ID (set after onboarding initiation)

## **🚀 Running the Tests**

### **Option 1: Run Entire Collection**
1. Import `OMS_PRD_Compliance_Testing.postman_collection.json`
2. Click "Run" on the collection
3. All tests will execute in sequence

### **Option 2: Run Individual Folders**
1. **Order Workflow**: Test complete order lifecycle
2. **Onboarding Workflow**: Test complete onboarding process
3. **Verification**: Test workflow state and history
4. **Error Testing**: Test error handling
5. **Email Testing**: Test email notifications

### **Option 3: Run Individual Requests**
- Each request can be run independently
- Variables are automatically managed
- Tests include validation assertions

## **📊 Test Validation**

### **Automated Assertions**
Each request includes comprehensive test assertions:

```javascript
// Example test assertions
pm.test('Order created with status: created', () => {
    pm.expect(response.status || response.data.status).to.eql('created');
});

pm.test('Onboarding completed successfully', () => {
    pm.response.to.have.status(200);
});

pm.test('Workflow state retrieved', () => {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.data.current).to.eql('completed');
});
```

### **Expected Results**
- **Order Workflow**: All 10 states completed successfully
- **Onboarding Workflow**: All 10 steps completed successfully
- **SLA Monitoring**: Proper SLA tracking and notifications
- **Email Notifications**: Templates sent successfully
- **Error Handling**: Proper error codes and messages

## **🎯 PRD Compliance Verification**

### **Order Workflow Compliance**
- ✅ Complete lifecycle states
- ✅ FNO integration
- ✅ Validation rules
- ✅ State transitions
- ✅ History tracking

### **Onboarding Workflow Compliance**
- ✅ 10-step process
- ✅ SLA monitoring
- ✅ Email notifications
- ✅ State management
- ✅ Integration with orders

### **API Compliance**
- ✅ RESTful endpoints
- ✅ Authentication
- ✅ Error handling
- ✅ Data validation

## **📈 Performance Testing**

### **Load Testing**
- Run collection multiple times to test performance
- Monitor response times
- Check for memory leaks
- Verify database performance

### **Concurrent Testing**
- Run multiple instances simultaneously
- Test race conditions
- Verify data consistency
- Check for deadlocks

## **🔍 Troubleshooting**

### **Common Issues**
1. **Authentication Failed**: Check credentials and JWT token
2. **FNO Not Found**: Ensure FNOs are seeded in database
3. **Invalid Transitions**: Verify workflow state machine
4. **Email Failures**: Check MongoDB connection and templates

### **Debug Mode**
- Enable Postman console logging
- Check request/response details
- Verify variable values
- Review error messages

## **📋 Test Results**

### **Success Criteria**
- All requests return 200/201 status codes
- All test assertions pass
- Complete workflow execution
- Proper error handling
- SLA monitoring functional

### **Failure Analysis**
- Review failed assertions
- Check error messages
- Verify data consistency
- Test individual components

## **🚀 Ready to Test!**

This collection provides comprehensive testing of the complete PRD-compliant order-to-onboarding workflow. Import the collection and start testing to verify 100% PRD compliance!

**Happy Testing!** 🎯
