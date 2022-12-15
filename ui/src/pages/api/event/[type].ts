import { client } from '../../../elastic/client';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req, res) => {
  const { type } = req.query;
  if (req.method === 'POST') {
    // Process a POST request

    try {
      const elasticRes = await client.create({
        id: uuidv4(),
        index: 'kubeobs',
        // type: String(type).toUpperCase(),
        body: req.body,
      });

      res.status(200).json(elasticRes.body);
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
