const express = require('express');
const dashRoutes = express.Router();
const {assignmentHistory,assetSelectOptions,assignAsset,fetchUserData,purchaseStock,transferStock,beforePurchaseDetails,purchaseHistory,beforeTransfer,transferHistory} = require('../Controller/StockHandel');
const AuthToken = require('../Middlewear/Auth');
const CsrfAuth = require('../Middlewear/CsrfAuth');
dashRoutes.get('/allUserData',AuthToken,CsrfAuth,fetchUserData);
dashRoutes.post('/purchaseStock',AuthToken,purchaseStock);
dashRoutes.post('/transferStock', AuthToken, transferStock); 
dashRoutes.get('/beforePurchaseDetails', AuthToken, beforePurchaseDetails);
dashRoutes.get('/purchaseHistory', AuthToken, purchaseHistory)
dashRoutes.get('/beforeTransfer',AuthToken,beforeTransfer)
dashRoutes.get('/transferHistory',AuthToken,transferHistory)
dashRoutes.post('/assignAsset',AuthToken,assignAsset)

dashRoutes.get('/assetSelectOptions',AuthToken,assetSelectOptions)
dashRoutes.get('/assignmentHistory',AuthToken,assignmentHistory)
module.exports = dashRoutes;