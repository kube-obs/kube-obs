import { client } from '../../elastic/client';

const handler = async (req, res) => {
  console.log('>>> received', req.body);
  if (req.method === 'POST') {
    // Process a POST request

    try {
      const elasticRes = await client.sql.query({
        body: req.body,
        format: 'json',
      });
      res.status(200).json(elasticRes.body);
    } catch (err) {
      console.error('>>> error', err);
      res.status(200).json({
        error: JSON.stringify(err),
      });
    }
  } else {
    // Handle any other HTTP method

    res.status(400).end();
  }
};

export const config = {
  api: {
    responseLimit: '100mb',
  },
};

export default handler;
