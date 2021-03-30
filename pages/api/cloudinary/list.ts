// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cloudinary from "../../../lib/cloudinary";

export default (req, res) => {
  const { tag, type, max_results } = req.query;
  Cloudinary.api.resources_by_tag(
    tag,
    { max_results, pages: true, context: true, moderations: true },
    function (error, result) {
      console.log(result);
      res.status(200).json(result);
    }
  );
};
