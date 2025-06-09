const cron = require('node-cron');
const EquipmentStock = require('../models/EquipmentStock');
const { sequelize } = require('../models/EquipmentStock');

function startMonthlyStockRollover() {
   
    cron.schedule('0 0 1 * *', async () => {
        console.log("⏰ Scheduler triggered!");
        const t = await sequelize.transaction();
        try {
            const now = new Date();
            const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
            const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

         
            const prevStocks = await EquipmentStock.findAll({
                where: { month: prevMonth, year: prevYear },
                transaction: t
            });

            for (const stock of prevStocks) {
                
                stock.closing_balance = stock.current_balance;
                await stock.save({ transaction: t });

                
                await EquipmentStock.create({
                    base_id: stock.base_id,
                    equipment_type_id: stock.equipment_type_id,
                    opening_balance: stock.current_balance,
                    closing_balance: null,
                    current_balance: stock.current_balance,
                    month: now.getMonth() + 1, 
                    year: now.getFullYear()
                }, { transaction: t });
            }

            await t.commit();
            console.log("EquipmentStock rolled over to new month.");
        } catch (error) {
            await t.rollback();
            console.error(" Error in monthly EquipmentStock rollover:", error);
        }
    });
}

module.exports = { startMonthlyStockRollover };