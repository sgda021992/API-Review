const express = require("express");
const router = express.Router();
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description fetch data for the dashboard
 */
router.get("/", auth, async (req, res) => {
  try {
    //   return res.json("sending dashboard data");
    const userId = req.user.id;

    const {
      totalFarmCount,
      totalUserCount,
      totalDrugInventoryCount,
      recievedOrder,
      pendingOrder,
      totalAnimalCount,
    } = await controller.Dashboard.fetchData();
    const farmAnimal = await controller.Dashboard.countAnimalInEachFarm();
    const { activeUsers: active, deactiveUsers: deactive } =
      await controller.countActInactUser();

    // get counts of following
    const { damCount } = await controller.countHeiferAndDam();
    const sireCount = await controller.sireCount();
    const calfCount = await controller.calfCount();
    const steerCount = await controller.steerCount();

    const regularFarmCount = await controller.regularFarmCount();
    const studFarmCount = await controller.studFarmCount();

    // reformat data
    let response = {
      user: { totalUserCount, userStatus: { active, deactive } },
      farm: { totalFarmCount, regularFarmCount, studFarmCount, farmAnimal },
      animal: {
        totalAnimalCount,
        damCount,
        sireCount,
        calfCount,
        steerCount,
      },
      drugInventory: { totalDrugInventoryCount, recievedOrder, pendingOrder },
    };

    // send response back
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response,
        },
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
});

module.exports = router;
