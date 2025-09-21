# 🚀 **Complete Order-to-Onboarding Workflow Testing Guide - Postman**

## **Prerequisites**
- Backend server running on `http://localhost:3003`
- Valid JWT token with order and onboarding permissions
- Database migration applied (011_onboarding_workflow_prd_compliance.sql)
- FNOs seeded in the database

---

## **Step 1: Authentication**
**POST** `http://localhost:3003/auth/login`
```json
{
  "method": "email",
  "email": "your-email@example.com",
  "password": "your-password"
}
```
**Response**: Copy the `accessToken` from the response

---

## **Step 2: Create Customer**
**POST** `http://localhost:3003/customers`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+27-82-123-4567",
  "address": {
    "street": "123 Test Street",
    "city": "Cape Town",
    "state": "Western Cape",
    "postalCode": "8001",
    "country": "South Africa"
  },
  "customerType": "business",
  "isTrial": false
}
```
**Response**: Copy the `id` from the created customer

---

## **Step 3: Create Order (Triggers Onboarding)**
**POST** `http://localhost:3003/orders`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "customerId": "<customer-id-from-step-2>",
  "orderType": "new_install",
  "priority": "medium",
  "serviceAddress": {
    "street": "123 Test Street",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001",
    "country": "South Africa"
  },
  "serviceDetails": {
    "serviceType": "internet",
    "bandwidth": "100/100",
    "installationType": "professional_install"
  }
}
```
**Response**: Copy the `orderId` from the response

---

## **Step 4: Order Workflow Progression**
**Note**: The order workflow must progress through specific states before onboarding can begin.

### **4.1: Validate Order**
**PATCH** `http://localhost:3003/orders/<order-id>/status`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "status": "validated"
}
```

### **4.2: Enrich Order**
**PUT** `http://localhost:3003/orders/<order-id>`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "serviceDetails": {
    "networkParams": {
      "vlan": 123,
      "port": "GigabitEthernet0/1"
    }
  }
}
```

**PATCH** `http://localhost:3003/orders/<order-id>/status`
```json
{
  "status": "enriched"
}
```

### **4.3: Set FNO and Submit**
**GET** `http://localhost:3003/fnos`
**Headers**: `Authorization: Bearer <accessToken>`
**Response**: Copy an FNO `id` from the response

**PUT** `http://localhost:3003/orders/<order-id>`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "fnoId": "<fno-id-from-previous-step>"
}
```

**PATCH** `http://localhost:3003/orders/<order-id>/status`
```json
{
  "status": "fno_submitted"
}
```

### **4.4: Progress Order to Installation**
**PATCH** `http://localhost:3003/orders/<order-id>/status`
```json
{
  "status": "fno_accepted"
}
```

**PATCH** `http://localhost:3003/orders/<order-id>/status`
```json
{
  "status": "installation_scheduled"
}
```

---

## **Step 5: Initiate Onboarding (After Order is Ready)**
**POST** `http://localhost:3003/onboarding/initiate`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "customerId": "<customer-id-from-step-2>",
  "orderId": "<order-id-from-step-3>",
  "onboardingType": "standard"
}
```
**Response**: Copy the `onboardingId` from the response

---

## **Step 6: Test Complete 10-Step Onboarding Workflow**

### **6.1: Check Initial State**
**GET** `http://localhost:3003/onboarding/<onboarding-id>/workflow/state`
**Headers**: `Authorization: Bearer <accessToken>`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "current": "initiated",
    "transitions": [
      {
        "fromState": "initiated",
        "toState": "welcome_sent",
        "name": "send_welcome_email"
      }
    ]
  }
}
```

### **6.2: Get Onboarding Steps**
**GET** `http://localhost:3003/onboarding/<onboarding-id>/steps`
**Headers**: `Authorization: Bearer <accessToken>`

**Expected Response**: 10 steps with `initiated` as completed, `welcome_sent` as in_progress

---

## **Step 7: Progress Through Each Onboarding Workflow Step**

### **7.1: Initiated → Welcome Sent**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/welcome_sent/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Welcome email sent successfully",
  "metadata": {
    "emailTemplate": "welcome_email",
    "sentAt": "2025-01-09T10:00:00Z"
  }
}
```

### **7.2: Welcome Sent → Service Setup**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/service_setup/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Service configuration completed",
  "metadata": {
    "serviceType": "fiber",
    "bandwidth": "100Mbps",
    "configuredAt": "2025-01-09T11:00:00Z"
  }
}
```

### **7.3: Service Setup → Equipment Ordered**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/equipment_ordered/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Equipment ordered from supplier",
  "metadata": {
    "supplier": "TechCorp",
    "orderNumber": "EQ-2025-001",
    "orderedAt": "2025-01-09T12:00:00Z"
  }
}
```

### **7.4: Equipment Ordered → Equipment Shipped**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/equipment_shipped/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Equipment shipped to customer",
  "metadata": {
    "trackingNumber": "TRK-123456789",
    "shippedAt": "2025-01-09T14:00:00Z",
    "estimatedDelivery": "2025-01-11T00:00:00Z"
  }
}
```

### **7.5: Equipment Shipped → Installation Scheduled**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/installation_scheduled/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Installation appointment scheduled",
  "metadata": {
    "appointmentDate": "2025-01-12T09:00:00Z",
    "technician": "Mike Johnson",
    "scheduledAt": "2025-01-09T16:00:00Z"
  }
}
```

### **7.6: Installation Scheduled → Installation Completed**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/installation_completed/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Installation completed successfully",
  "metadata": {
    "completedAt": "2025-01-12T11:30:00Z",
    "technician": "Mike Johnson",
    "signalStrength": "excellent",
    "testResults": "passed"
  }
}
```

### **7.7: Installation Completed → Service Activated**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/service_activated/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Service activated and tested",
  "metadata": {
    "activatedAt": "2025-01-12T12:00:00Z",
    "speedTest": "98Mbps",
    "latency": "12ms",
    "customerNotified": true
  }
}
```

### **7.8: Service Activated → Follow-up**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/follow_up/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Follow-up call completed",
  "metadata": {
    "followUpDate": "2025-01-15T10:00:00Z",
    "customerSatisfaction": "excellent",
    "issues": "none",
    "nextCheck": "2025-01-22T00:00:00Z"
  }
}
```

### **7.9: Follow-up → Completed**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/completed/complete`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "notes": "Onboarding process completed successfully",
  "metadata": {
    "completedAt": "2025-01-15T10:30:00Z",
    "totalDuration": "6 days",
    "customerSatisfaction": "excellent",
    "nextAction": "regular_monitoring"
  }
}
```

---

## **Step 8: Verification Tests**

### **8.1: Check Final State**
**GET** `http://localhost:3003/onboarding/<onboarding-id>/workflow/state`
**Expected**: `current: "completed"`, `transitions: []`

### **8.2: Check Workflow History**
**GET** `http://localhost:3003/onboarding/<onboarding-id>/workflow/history`
**Expected**: Complete history of all 9 transitions with durations

### **8.3: Check Final Steps Status**
**GET** `http://localhost:3003/onboarding/<onboarding-id>/steps`
**Expected**: All 10 steps with `completed` status

### **8.4: Check Onboarding Details**
**GET** `http://localhost:3003/onboarding/<onboarding-id>`
**Expected**: `current_step: "completed"`, `completion_percentage: 100`

---

## **Step 9: Error Testing**

### **9.1: Test Invalid Transition**
**PUT** `http://localhost:3003/onboarding/<onboarding-id>/step/invalid_step/complete`
**Expected**: 400 error with message about invalid transition

### **9.2: Test Skipping Steps**
Try to go from `initiated` directly to `equipment_ordered`
**Expected**: 400 error about invalid transition

### **9.3: Test Non-existent Onboarding**
**GET** `http://localhost:3003/onboarding/invalid-id/workflow/state`
**Expected**: 404 error

---

## **Step 10: SLA Testing**

### **10.1: Check SLA Metrics**
**GET** `http://localhost:3003/onboarding/metrics`
**Headers**: `Authorization: Bearer <accessToken>`
**Expected**: SLA statistics and statuses

### **10.2: Test SLA Warning**
Create a new onboarding and leave it in `rep_contact_scheduled` for 25+ hours
**Expected**: SLA warning notifications

---

## **Step 11: Email Testing**

### **11.1: Test Welcome Email**
**POST** `http://localhost:3003/onboarding/<onboarding-id>/notify`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "to": "john.doe@example.com",
  "template": "welcome_email",
  "context": {
    "customerName": "John Doe",
    "serviceType": "Fiber Internet"
  }
}
```

### **11.2: Test Step-specific Emails**
**POST** `http://localhost:3003/onboarding/<onboarding-id>/notify`
**Headers**: `Authorization: Bearer <accessToken>`
```json
{
  "to": "john.doe@example.com",
  "template": "onboarding_installation_scheduled",
  "context": {
    "customerName": "John Doe",
    "appointmentDate": "2025-01-12T09:00:00Z",
    "technician": "Mike Johnson"
  }
}
```

---

## **Step 12: Bulk Testing**

### **12.1: Create Multiple Onboardings**
Create 3-5 different customers and onboardings to test:
- Different onboarding types (standard, trial)
- Different current steps
- Different completion percentages

### **12.2: Test Active Onboardings List**
**GET** `http://localhost:3003/onboarding/active`
**Expected**: List of all active onboardings with their current states

---

## **🎯 Expected Results Summary**

After completing all steps, you should have:

1. **✅ Complete order workflow** tested end-to-end (created → validated → enriched → fno_submitted → fno_accepted → installation_scheduled)
2. **✅ Complete 10-step onboarding workflow** tested end-to-end
3. **✅ Order-to-onboarding integration** working correctly
4. **✅ All transitions working** correctly
5. **✅ Workflow history** properly recorded
6. **✅ SLA monitoring** functional
7. **✅ Email notifications** working
8. **✅ Error handling** tested
9. **✅ State validation** working
10. **✅ Backend-frontend alignment** confirmed

## **📊 Success Criteria**

- Order workflow progresses through all required states
- FNO integration works correctly
- Onboarding can be initiated after order reaches `installation_scheduled`
- All 10 onboarding steps can be completed in sequence
- No invalid transitions are allowed
- Workflow history is properly recorded
- SLA metrics are accurate
- Email templates are sent correctly
- Frontend displays correct step statuses
- Backend and onboarding service are aligned
- Order and onboarding workflows are properly integrated

## **🔄 Complete Workflow Overview**

**Order Workflow**: `created` → `validated` → `enriched` → `fno_submitted` → `fno_accepted` → `installation_scheduled` → `in_progress` → `installed` → `activated` → `completed`

**Onboarding Workflow**: `initiated` → `welcome_sent` → `service_setup` → `equipment_ordered` → `equipment_shipped` → `installation_scheduled` → `installation_completed` → `service_activated` → `follow_up` → `completed`

**Integration Point**: Onboarding can be initiated once the order reaches `installation_scheduled` status.

**Ready to test!** 🚀
