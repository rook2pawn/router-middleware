var url = require('url')
module.exports = exports = next
function next() {
  var that = this.that
  var pathname = url.parse(this.req.url).pathname
  if (pathname === undefined) 
    return
  this.index++;
  if (this.fnindex === undefined) {
    if ((this.req.method == 'GET') && (that.routes[this.req.method][pathname][this.index] === undefined) && (that.fileserver !== undefined)) {
      that.fileserver(this.req,this.res)
    } else 
      that.routes[this.req.method][pathname][this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index,that:that}));
  } else {
    if ((this.req.method == 'GET') && (that.routes[this.req.method].fns[this.fnindex].middleware[this.index] === undefined) && (that.fileserver !== undefined)) {
      that.fileserver(this.req,this.res)
    } else 
      that.routes[this.req.method].fns[this.fnindex].middleware[this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index,fnindex:this.fnindex,that:that}));
  }
}
