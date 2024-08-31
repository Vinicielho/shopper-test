# shopper-test
This is my technical test for applying to the job oportunity at shopper!

It is a node.js application using typescript, which also puts up its own database in a separate container, so we can interface with gemini image API to ask it about values in pictures of meters to generate and save bills. There is also a frontend folder, but that is supposed to be the next part of the challange.

As demanded, you start it up by running "sudo docker-compose up --build" on the shopper-test folder. But theres something i'd like to clear up: there are hardcoded adresses and such on the docker-compose file, i do not like that, but the challange stated that a script was going to add its own env file, but it did not made clear wether it would put anything other than the necessary apiKey so i decided to err in the side of caution. And so, it runs.

It has the demanded 3 edpoints:
    POST /upload
        Recevies:
            {
            "image": "base64",
            "customer_code": "string",
            "measure_datetime": "datetime",
            "measure_type": "WATER" ou "GAS"
            }
        And then Checks for the propper datatypes and describe those as demanded by google's API, Verifies if such bill already exists in the db, and only then makes the request to be parsed and made into a bill to be saved.

    PATCH /confirm
        Receives:
            {
            "measure_uuid": "string",
            "confirmed_value": integer
            }
        So it validates the received datatypes, check if described bill exists already, and then if it has benn already been confirmed. Then finally saves the new data.
    
    GET /<customer code>/list
        Receives a client's id, and maybe the measure's type so it can answer with only the necessary info, othewise it will give all it finds.

I really wished i could have tested it more, but i had a huge problem with the google api refusing my images for "security concerns" after a couple tests, i was only sending the base64 images of gas/water meters. And even when i managed to get it to accept me once more, it soon got angry again. That was just cruel :/

I am happy to have been given this challange, there were some concepts i had not interacted with at all (base64 image files), and i tried to use the least external libraries i could to solve as many problems as i could myself. Given more time i would have, as said, tested my application more (instead of google's cryptic whims) and defnitely written this in a more "functional" way, which i'm rather, but lacked time to pay it more care. But i'm still satisfied with the way the code ended up working with regards to there being minimal repetition of information(and declarations, thanks typescript!), i love being able to update things in a single place so application just calls it where it is needed (even with the env file thing, missed oportunity there!) thanks to the loosely mvc pattern, which i think its neat, i like neat coding. I hope it will be enough to give me the oportunity with what i have the most experience, the frontend!