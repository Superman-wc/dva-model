
build:
	npm run build
	rm -rf dist
	mkdir -p dist
	NODE_ENV=development ./node_modules/.bin/browserify index.js --standalone=model -g browserify-shim -t envify > dist/model.js
	NODE_ENV=development ./node_modules/.bin/browserify effect.js --standalone=effect -g browserify-shim -t envify > dist/effect.js
	NODE_ENV=development ./node_modules/.bin/browserify restful.js --standalone=restful -g browserify-shim -t envify > dist/restful.js
publish: build
	npm publish

publish-beta: build
	npm publish --tag beta
