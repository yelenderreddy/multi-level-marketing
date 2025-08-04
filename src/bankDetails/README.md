# Bank Details API Documentation

This document describes the Bank Details API endpoints for managing user bank account information.

## Base URL
```
/api/bankDetails
```

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Bank Details
**GET** `/getBankDetails/:userId`

Retrieves bank details for a specific user.

**Parameters:**
- `userId` (number, required): The ID of the user

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details fetched successfully",
  "data": {
    "id": 1,
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "accountHolderName": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210",
      "referral_code": "REF123",
      "referralCount": 5,
      "wallet_balance": 1000,
      "payment_status": "paid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Create Bank Details
**POST** `/createBankDetails/:userId`

Creates new bank details for a user. Will fail if bank details already exist.

**Parameters:**
- `userId` (number, required): The ID of the user

**Request Body:**
```json
{
  "bankName": "State Bank of India",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "John Doe"
}
```

**Validation Rules:**
- `bankName`: Required, max 255 characters
- `accountNumber`: Required, 9-18 digits only
- `ifscCode`: Required, must match format: 4 letters + 0 + 6 alphanumeric characters
- `accountHolderName`: Required, 2-255 characters

**Response:**
```json
{
  "statusCode": 201,
  "message": "Bank details created successfully",
  "data": {
    // Same structure as GET response
  }
}
```

### 3. Update Bank Details
**PUT** `/updateBankDetails/:userId`

Updates existing bank details for a user. Will fail if no bank details exist.

**Parameters:**
- `userId` (number, required): The ID of the user

**Request Body:**
```json
{
  "bankName": "HDFC Bank",
  "accountNumber": "9876543210",
  "ifscCode": "HDFC0001234",
  "accountHolderName": "John Doe"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details updated successfully",
  "data": {
    // Same structure as GET response
  }
}
```

### 4. Create or Update Bank Details
**POST** `/createOrUpdateBankDetails/:userId`

Creates new bank details if none exist, or updates existing ones.

**Parameters:**
- `userId` (number, required): The ID of the user

**Request Body:**
```json
{
  "bankName": "State Bank of India",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "John Doe"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details created/updated successfully",
  "data": {
    // Same structure as GET response
  }
}
```

### 5. Delete Bank Details
**DELETE** `/deleteBankDetails/:userId`

Deletes bank details for a user.

**Parameters:**
- `userId` (number, required): The ID of the user

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details deleted successfully",
  "data": {
    "message": "Bank details deleted successfully"
  }
}
```

### 6. Check Bank Details Existence
**GET** `/checkBankDetails/:userId`

Checks if bank details exist for a user without returning the actual data.

**Parameters:**
- `userId` (number, required): The ID of the user

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details found",
  "data": {
    "hasBankDetails": true
  }
}
```

### 7. Validate Bank Details
**POST** `/validateBankDetails`

Validates bank details without saving them to the database.

**Request Body:**
```json
{
  "bankName": "State Bank of India",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "John Doe"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Bank details are valid",
  "data": {
    "isValid": true,
    "errors": []
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "data": [
    {
      "property": "ifscCode",
      "value": "INVALID",
      "constraints": {
        "matches": "Invalid IFSC code format"
      }
    }
  ]
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Bank details not found for this user",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "data": null
}
```

## Validation Rules

### IFSC Code Format
- Must be exactly 11 characters
- First 4 characters: Letters only
- 5th character: Must be '0'
- Last 6 characters: Alphanumeric

**Examples:**
- ✅ `SBIN0001234`
- ✅ `HDFC0005678`
- ❌ `SBIN001234` (missing 0)
- ❌ `SBIN000123` (too short)

### Account Number Format
- Must be 9-18 digits only
- No spaces, hyphens, or other characters

**Examples:**
- ✅ `1234567890`
- ✅ `987654321098765`
- ❌ `123456789` (too short)
- ❌ `1234567890123456789` (too long)
- ❌ `123456789a` (contains letters)

### Bank Name and Account Holder Name
- Required fields
- Maximum 255 characters
- Account holder name minimum 2 characters

## Usage Examples

### Frontend Integration (JavaScript)

```javascript
// Create bank details
const createBankDetails = async (userId, bankDetails) => {
  const response = await fetch(`/api/bankDetails/createBankDetails/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bankDetails)
  });
  return response.json();
};

// Get bank details
const getBankDetails = async (userId) => {
  const response = await fetch(`/api/bankDetails/getBankDetails/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Validate bank details before submission
const validateBankDetails = async (bankDetails) => {
  const response = await fetch('/api/bankDetails/validateBankDetails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bankDetails)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get bank details
curl -X GET "http://localhost:3000/api/bankDetails/getBankDetails/1" \
  -H "Authorization: Bearer your-jwt-token"

# Create bank details
curl -X POST "http://localhost:3000/api/bankDetails/createBankDetails/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "bankName": "State Bank of India",
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "John Doe"
  }'

# Update bank details
curl -X PUT "http://localhost:3000/api/bankDetails/updateBankDetails/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "bankName": "HDFC Bank",
    "accountNumber": "9876543210",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "John Doe"
  }'
``` 