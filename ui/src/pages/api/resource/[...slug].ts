import { client } from '../../../elastic/client';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req, res) => {
  const { slug } = req.query;
  if (req.method === 'POST') {
    if (!Array.isArray(slug)) {
      res.status(400).json({
        error: 'Unable to parse ID',
      });
      return;
    }

    if (slug.length < 2) {
      res.status(400).json({
        error: 'ID must be provided as path some/id/for/resource',
      });
      return;
    }

    const documentID = slug.join('/');

    try {
      const deleteRes = await client.delete({
        id: documentID,
        index: "kubeobs",
      })
    } catch (err) {
      // ignore errors
    }
    // Process a POST request

    try {
      const esReq = {
        id: documentID,
        // type: resourceType,
        index: 'kubeobs',
        body: req.body,
      };

      console.log('>>>> esReq', esReq);
      const elasticRes = await client.create(esReq);

      res.status(200).json(elasticRes);
    } catch (err) {
      res.status(400).json({
        error: err,
      });
    }
  } else {
    // Handle any other HTTP method
    res.status(400).end();
  }
};

export default handler;
