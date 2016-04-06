###Setup:###
'''
npm install;
createdb sockmsg;

// Create a secret for signing cookies
echo SECRET=$(node -e "require('crypto').random
Bytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env

echo \*.env >> .gitignore

echo "ENVIRONMENT=development" >> .gitignore
'''
a
