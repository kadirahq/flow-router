describe('Group', () => {

	const router = new Router();		

	context('class', () => {

		it('should exist', () => {
			expect(Group).to.exist;
		});

		it('should be an extension of the SharedGroup', () => {
			const newGroup = new Group(router);
			expect(newGroup).to.be.an.instanceof(Group)
			expect(newGroup).to.be.an.instanceof(SharedGroup)
		});

	});

	context('functionalities', () => {

		context('define and go to route', () => {

			const prefix = '/' + Random.id();
			 const rand = '/' + Random.id();

			it('should work with prefix', () => {
			  const newGroup = new Group(router ,{prefix})
			  let rendered = 0;
			 
			  newGroup.route(rand, {
			  	action(_params) {			  		
			  		rendered++
			  	}
			  });

			  // No way to check if route is working

			  expect(rendered).to.be.equal(1);

			});

			it('should work without prefix', () => {
				
			  const newGroup = new Group(router)
			  let rendered = 0;
			 
			  newGroup.route(rand, {
			  	action(_params) {			  		
			  		rendered++
			  	}
			  })

			  // No way to check if route is working

			  expect(rendered).to.be.equal(1)

			});
		});

		it('should set and retrieve group name', () => {

			const prefix = "/" +Random.id();
  		const name = Random.id();
  		let newName = ""

			const newGroup = new Group(router, {prefix, name})

			// no way to check if route is working

			expect(newName).to.be.equal(name)

		})
	})
})