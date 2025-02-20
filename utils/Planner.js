const {PlacesClient} = require('@googlemaps/places').v1;
const { CohereClient } = require('cohere-ai');

async function cohereSearch(userInput) {
  const client = new CohereClient({ token: "XqnWbDC2cKTQG2VTRSGM76l4iCBe3e8ngR7qAXtW" });
  console.log("userInput: ", userInput);
  const response1 = await client.chat({
    message: `
You are a travel planner, and are generating queries for Google searches. you must include the city/location name in the queries.

Rules for generating queries:

Focus on highly-rated or popular spots
Must include one query for high-rated food in the city/location
Each query should be on a new line
Don't include numbers or bullet points
No additional text, just the queries.
Queries must be vague but must represent the client's interests
Queries MUST include the city/location name
Generate, at the minimum, 7 queries
Must not use descriptors, such as famous, unique, scenic, popualr, etc.

Here is information about your client: ${userInput}`,
    model: "command-r-08-2024",
  });
  const queries = response1.chatHistory[1].message.split('\n');
  console.log("queries: ", queries);
  return queries;
}

async function callSearchText(userInput) {
    const apiKey = "AIzaSyDb7u7p2NRw7lKnb0YC2yFxl5J4CeAx3D0";
    const placesClient = new PlacesClient({ apiKey });
    const queries = await cohereSearch(userInput);
    const placeList = {};
    for (const query of queries) {
    const request = {
        textQuery: query,
    };

    const response = await placesClient.searchText(request, {
        otherArgs: {
          headers: {
            'X-Goog-FieldMask': 'places.displayName',
          },
        },
      });
    const places = response[0].places;
    for (const place of places) {
        console.log("place: ", place.displayName.text);
        if (!placeList[query]) {
            placeList[query] = place.displayName.text;
        } else {
            placeList[query] += ", " + place.displayName.text;
        }
    }
  }
  console.log("--------------------------------")
  console.log(placeList);
  return placeList;
}

async function getItinerary(userInput, city, numberOfDays) {
    console.log("userInput: ", userInput);
    console.log("city: ", city);
    console.log("numberOfDays: ", numberOfDays);
    const places = await callSearchText(userInput + " in " + city);
    const placeString = Object.values(places).join('\n');
    console.log(placeString);
    const client = new CohereClient({ token: "XqnWbDC2cKTQG2VTRSGM76l4iCBe3e8ngR7qAXtW" });
    const response1 = await client.chat({
      message: `
      You are a travel planner, and are generating an itinerary for a client.

      They are visiting ${city} for ${numberOfDays} days.

      Here is the list of possible places the client wants to visit:
      ${placeString}
      Generate an itinerary for the client. These should be specific, giving the actual time of day and duration of the visit. Everyday should have Breakfast, Lunch, and Dinner (if applicable). Make sure none of the times in the itinerary overlap, and give the person some time between each activity for rest and commute (15 minutes to 1 hour, depending on the activity). Please reference locations and restaurants by name specifically in the itinerary. Meals should be reasonable, ie. no sushi for breakfast, no pasta for breakfast, no coffee shops for dinner, etc. Time for meals should be reasonable, ie. no 11am breakfast, 5pm lunch, 11pm dinner. Each meal should have a different type of food. Try to have variety in meal choice. Only include the itinerary, no other text. Each activity should be directly after another, so there should be no gaps in time. For food, you should only be able to eat at restaurants, not just any random location. Should be formatted as the following:
      Time - Activity+Location

      Do not make an activity for the staying overnight at the hotel. That should be a given.
      The general format for the itinerary is:
      #Day X
      Time - Activity+Location
      `
      ,
      model: "command-r-08-2024",
    });
    console.log(response1.chatHistory[1].message)
    const queries = response1.chatHistory[1].message.split('\n');
    console.log("--------------------------------")
    console.log(queries)
    return queries;
}

export async function getFinal(userInput, city, numberOfDays) {
    const itinerary = await getItinerary(userInput, city, numberOfDays);
    return itinerary;
}