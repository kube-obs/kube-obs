import { client } from '../../../elastic/client';

const handler = async (req, res) => {
  const { index } = req.query;
  if (req.method === 'GET') {
    // Process a POST request

    const elasticRes = await client.search({
      index: index,
      body: req.body,
    });

    res.status(200).json(elasticRes.body);
  } else {
    // Handle any other HTTP method

    res.status(400).end();
  }
};

export default handler;
