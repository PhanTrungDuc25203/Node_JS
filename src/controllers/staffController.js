import staffService from "../services/staffService";

let createResultTemplate = async (req, res) => {
    try {
        let response = await staffService.createResultTemplateService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create exam package result template error from server!",
        });
    }
};

module.exports = {
    createResultTemplate: createResultTemplate,
};
