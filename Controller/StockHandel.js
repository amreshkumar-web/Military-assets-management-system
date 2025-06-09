const User = require('../models/User');
const EquipmentType = require('../models/EquipmentType');
const Purchase = require('../models/Purchase');
const Transfer = require('../models/Transfer');
const EquipmentStock = require('../models/EquipmentStock');
const { sequelize } = require('../models/EquipmentStock'); 
const Base = require('../models/Base');
const { Model } = require('sequelize');
const AssetExpenditure = require('../models/AssetExpenditure');
const AssetAssignment = require('../models/AssetAssignment');

const fetchUserData = async (req, res) => {
  const { jUserAccess, jUserBaseId } = req.user;
  try {
    let where = {};
    if (jUserAccess !== "Admin") {
      where.base_id = jUserBaseId;
    }
    const stocks = await EquipmentStock.findAll({
      where,
      include: [
        { model: Base, attributes: ['id', 'name'] },
        { model: EquipmentType, attributes: ['id', 'name', 'category'] }
      ],
      attributes: [
        'id',
        'base_id',
        'equipment_type_id',
        'opening_balance',
        'closing_balance',
        'current_balance',
        'month',
        'year',
        'updatedAt'
      ],
      order: [['updatedAt', 'DESC']]
    });

    if (!stocks || stocks.length === 0)
      return res.status(404).json({ message: "No stock data found" });

    return res.status(200).json({ data: stocks });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};






const purchaseStock = async (req, resp) => {
    // Convert IDs to numbers
    const baseID = Number(req.body.baseID);
    const equipmentTypeId = Number(req.body.equipmentTypeId);
    const quantity = Number(req.body.quantity);
    const { jUserAccess, jUserBaseId, jUserId } = req.user;
    const userBaseId = Number(jUserBaseId);

    const t = await sequelize.transaction();
    try {
        if (jUserAccess === "Logistics Officer" && (equipmentTypeId === 1 || equipmentTypeId === 2))
            return resp.status(400).json({ message: "You are not authorized to buy this item" });

        if (jUserAccess !== "Admin" && userBaseId !== baseID)
            return resp.status(403).json({ message: "You do not have permission to purchase stock for another base" });

        if (!baseID || !equipmentTypeId || !quantity)
            return resp.status(400).json({ message: "All fields are required" });

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const stock = await EquipmentStock.findOne({
            where: { base_id: baseID, equipment_type_id: equipmentTypeId, month, year },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!stock) {
            await t.rollback();
            return resp.status(400).json({ message: "Stock record not found for this month" });
        }

        stock.current_balance = Number(stock.current_balance) + quantity;
        await stock.save({ transaction: t });

        const purchase = await Purchase.create({
            base_id: baseID,
            equipment_type_id: equipmentTypeId,
            quantity: quantity,
            purchase_date: new Date(),
            updated_balance: stock.current_balance,
            purchase_by: jUserId
        }, { transaction: t });

        await t.commit();
        return resp.status(200).json({ message: "Purchase successful", purchase });

    } catch (error) {
        await t.rollback();
        console.error("Purchase error:", error);
        return resp.status(500).json({ message: "Internal Server Error" });
    }
};











const transferStock = async (req, resp) => {
    // Convert all IDs to numbers immediately
    const fromBaseId = Number(req.body.fromBaseId);
    const toBaseId = Number(req.body.toBaseId);
    const equipmentTypeId = Number(req.body.equipmentTypeId);
    const quantity = Number(req.body.quantity);
    const { jUserAccess, jUserBaseId, jUserId } = req.user;
    const userBaseId = Number(jUserBaseId);

    console.log("hitted");

    if (fromBaseId === toBaseId)
        return resp.status(403).json({ message: "Bot Bases are same " });

    if (jUserAccess === "Logistics Officer" && (equipmentTypeId === 1 || equipmentTypeId === 2))
        return resp.status(400).json({ message: "You are not authorized to buy this item" });

    if (jUserAccess !== "Admin" && userBaseId !== fromBaseId)
        return resp.status(403).json({ message: "You do not have permission to transfer stock from this base" });

    if (!fromBaseId || !toBaseId || !equipmentTypeId || !quantity)
        return resp.status(400).json({ message: "All fields are required" });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const transferDate = now;

    const t = await sequelize.transaction();
    try {
        // 1. Check and update source stock
        const fromStock = await EquipmentStock.findOne({
            where: { base_id: fromBaseId, equipment_type_id: equipmentTypeId, month, year },
            transaction: t,
        });

        if (!fromStock)
            return resp.status(400).json({ message: "Source stock record not found for this month" });
        if (Number(fromStock.current_balance) < quantity)
            return resp.status(400).json({ message: "Insufficient stock in source base" });

        fromStock.current_balance = Number(fromStock.current_balance) - quantity;
        await fromStock.save({ transaction: t });

        // 2. Create transfer record
        const transfer = await Transfer.create({
            from_base_id: fromBaseId,
            to_base_id: toBaseId,
            equipment_type_id: equipmentTypeId,
            quantity: quantity,
            transfer_date: transferDate,
            remaining_balance: fromStock.current_balance,
            transfer_by: jUserId
        }, { transaction: t });

        // 3. Update or create destination stock
        let toStock = await EquipmentStock.findOne({
            where: { base_id: toBaseId, equipment_type_id: equipmentTypeId, month, year },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!toStock) {
            // Get previous month's closing balance for opening_balance
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            const prevStock = await EquipmentStock.findOne({
                where: { base_id: toBaseId, equipment_type_id: equipmentTypeId, month: prevMonth, year: prevYear },
                transaction: t
            });
            const opening_balance = prevStock ? Number(prevStock.closing_balance) || 0 : 0;

            toStock = await EquipmentStock.create({
                base_id: toBaseId,
                equipment_type_id: equipmentTypeId,
                opening_balance,
                closing_balance: null,
                current_balance: opening_balance + quantity,
                month,
                year
            }, { transaction: t });
        } else {
            toStock.current_balance = Number(toStock.current_balance) + quantity;
            await toStock.save({ transaction: t });
        }

        await t.commit();
        return resp.status(200).json({ message: "Transfer successful", transfer });

    } catch (error) {
        if (t) await t.rollback();
        const msg = error.message || "Internal Server Error";
        return resp.status(400).json({ message: msg });
    }
};


const beforePurchaseDetails = async (req, resp) => {
    const { jUserAccess, jUserBaseId } = req.user;
    try {
        const equipmentTypes = await EquipmentType.findAll({
            attributes: ["id", "name","category"]
        });

        let bases;
        if (jUserAccess === "Admin") {
            bases = await Base.findAll({
                attributes: ["id", "name"]
            });
        } else {
            bases = await Base.findAll({
                where: { id: jUserBaseId },
                attributes: ["id", "name"]
            });
        }

        if (!equipmentTypes.length || !bases.length)
            return resp.status(404).json({ message: "No data found" });

        return resp.status(200).json({ equipmentTypes, bases });
    } catch (error) {
        console.log("Error fetching before purchase details:", error);
        return resp.status(500).json({ message: "Internal Server Error" });
    }
};



const purchaseHistory = async (req, resp) => {
    const {jUserAccess,jUserBaseId,jUserId} = req.user;
    try {
 let hData = [];
   if(jUserAccess !== "Admin"){
        hData = await Purchase.findAll({
            where:{base_id:jUserBaseId},
            include: [
                { model: Base, attributes: ['name', 'id'] },
                { model: EquipmentType, attributes: ['name', 'id','category'] },
                { model: User, attributes: ['name', 'id'] }
            ]
        });
   }
   else{
       hData = await Purchase.findAll({
            include: [
                { model: Base, attributes: ['name', 'id'] },
                { model: EquipmentType, attributes: ['name', 'id','category'] },
                { model: User, attributes: ['name', 'id'] }
            ]
        });
   }

        if (!hData || hData.length === 0)
            return resp.status(404).json({ message: "Data not found" });

        return resp.status(200).json({ data: hData });
    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error" });
    }
};








const transferHistory = async (req, resp) => {
    const { jUserAccess, jUserBaseId } = req.user;
    const userBaseId = Number(jUserBaseId); 
    try {
        let tData = [];
        if (jUserAccess !== "Admin") {
            tData = await Transfer.findAll({
                where: { from_base_id: userBaseId },
                include: [
                    { model: Base, as: 'fromBase', attributes: ['id', 'name'] },
                    { model: Base, as: 'toBase', attributes: ['id', 'name'] },
                    { model: EquipmentType, attributes: ['id', 'name', 'category'] },
                    { model: User, attributes: ['id', 'name','base_id'] }
                ]
            });
        } else {
            tData = await Transfer.findAll({
                include: [
                    { model: Base, as: 'fromBase', attributes: ['id', 'name'] },
                    { model: Base, as: 'toBase', attributes: ['id', 'name'] },
                    { model: EquipmentType, attributes: ['id', 'name', 'category'] },
                    { model: User, attributes: ['id', 'name'] }
                ]
            });
        }

        if (!tData || tData.length === 0) return resp.status(404).json({ message: "Data not found" });

        return resp.status(200).json({ data: tData });
    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error" });
    }
};










const beforeTransfer = async (req, resp) => {
    const { jUserAccess, jUserBaseId } = req.user;

    try {
        const [bases, equipment] = await Promise.all([
    Base.findAll({ attributes: ['id', 'name'] }),
    EquipmentType.findAll({ attributes: ['id', 'name'] })
]);

        if (!bases || !equipment || equipment.length ===0 || bases.length === 0 ) {
            return resp.status(500).json({ message: "Something Went Wrong" });
        }

        if (jUserAccess !== "Admin") {
            const fromBase = bases.find(b => b.id === jUserBaseId);
            const toBase = bases.filter(b => b.id !== jUserBaseId);
            return resp.status(200).json({ fromBase, toBase , equipment });
        } else {
            // For admin, you can return all bases as both fromBase and toBase, or adjust as needed
            return resp.status(200).json({ fromBase:bases,toBase:bases,equipment });
        }
    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error" });
    }
};




const assignAsset = async (req, res) => {
  
  const base_id = Number(req.body.base_id);
  const equipment_type_id = Number(req.body.equipment_type_id);
  const assigned_to = Number(req.body.assigned_to);
  const quantity = Number(req.body.quantity) || 1;
  const { jUserAccess, jUserBaseId, jUserId } = req.user;
  const userBaseId = Number(jUserBaseId);

  if (jUserAccess !== "Admin" && base_id !== userBaseId)
    return res.status(403).json({ message: "You do not have permission to assign assets from this base" });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const stock = await EquipmentStock.findOne({
    where: { base_id, equipment_type_id, month, year }
  });
  if (!stock) return res.status(404).json({ message: "Stock not found for this base and equipment" });

  if (stock.current_balance < quantity)
    return res.status(400).json({ message: "Insufficient stock balance" });

  stock.current_balance -= quantity;
  await stock.save();

  const assignment = await AssetAssignment.create({
    base_id,
    equipment_type_id,
    assigned_to,
    assigned_by: jUserId,
    quantity,
    remarks: req.body.remarks
  });

  res.status(201).json({ message: "Asset assigned", assignment });
};







const assetSelectOptions = async (req, resp) => {
    console.log("hitted")
  const { jUserAccess, jUserBaseId } = req.user;

  try {
    if (jUserAccess === "Admin") {
  const [bases, equipment, users] = await Promise.all([
    Base.findAll({ attributes: ['id', 'name'] }),
    EquipmentType.findAll({ attributes: ['id', 'name', 'category'] }),
    User.findAll({ attributes: ['id', 'name', 'base_id'] }),
  ]);
  console.log(bases,equipment,users)
  return resp.status(200).json({ bases, users, equipment });
} else {
  const [bases, equipment, users] = await Promise.all([
    Base.findAll({ where: { id: jUserBaseId }, attributes: ['id', 'name'] }),
    EquipmentType.findAll({ attributes: ['id', 'name', 'category'] }),
    User.findAll({ where: { base_id: jUserBaseId }, attributes: ['id', 'name', 'base_id'] }),
  ]);
  return resp.status(200).json({ bases , users, equipment });
}
  } catch (error) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};




const assignmentHistory = async (req, res) => {
  const { jUserAccess, jUserBaseId } = req.user;
  try {
    let where = {};
    if (jUserAccess !== "Admin") {
      where.base_id = jUserBaseId;
    }
    const history = await AssetAssignment.findAll({
      where,
      include: [
        { model: Base, attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name','base_id'] },
        { model: User, as: 'assigner', attributes: ['id', 'name'] },
        { model: EquipmentType, attributes: ['id', 'name', 'category'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    if (!history || history.length === 0)
      return res.status(404).json({ message: "No assignment history found" });
    return res.status(200).json({ data: history });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports ={assetSelectOptions,assignmentHistory,assignAsset,fetchUserData,purchaseStock,transferStock,beforePurchaseDetails,purchaseHistory,beforeTransfer,transferHistory};