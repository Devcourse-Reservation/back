const Airports = require('../models/Airport');

const insertAirports = async () => {
  try {
    await Airports.bulkCreate([
      {
        name: 'Los Angeles International Airport',
        code: 'LAX',
        city: 'Los Angeles',
        country: 'USA',
      },
      {
        name: 'John F. Kennedy International Airport',
        code: 'JFK',
        city: 'New York',
        country: 'USA',
      },
      {
        name: 'San Francisco International Airport',
        code: 'SFO',
        city: 'San Francisco',
        country: 'USA',
      },
      {
        name: 'Chicago O’Hare International Airport',
        code: 'ORD',
        city: 'Chicago',
        country: 'USA',
      },
      {
        name: 'Incheon International Airport',
        code: 'ICN',
        city: 'Incheon',
        country: 'South Korea',
      },
    ]);
    console.log('Airports inserted successfully!');
  } catch (error) {
    console.error('Error inserting airports:', error);
  }
};

insertAirports();