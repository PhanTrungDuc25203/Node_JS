import searchService from "../services/searchService";

let allMedicalServiceFilterSearch = async (req, res) => {
  try {
    let { searchterm, filter } = req.query;
    let result = await searchService.allMedicalServiceFilterSearchService(
      searchterm,
      filter
    );
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Search error from server!",
    });
  }
};

module.exports = {
  allMedicalServiceFilterSearch,
};
