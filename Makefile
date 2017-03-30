
build:
	npm run build
	rm -rf dist
	mkdir -p dist
	NODE_ENV=development ./node_modules/.bin/browserify index.js --standalone=model -g browserify-shim -t envify > dist/model.js
	./node_modules/.bin/uglifyjs -o dist/model-min.js dist/model.js
	NODE_ENV=development ./node_modules/.bin/browserify effect.js --standalone=effect -g browserify-shim -t envify > dist/effect.js
	./node_modules/.bin/uglifyjs -o dist/effect-min.js dist/effect.js
publish: build
	npm publish

publish-beta: build
	npm publish --tag beta
