import  express  from "express";
import bodyParser from "body-parser";
import request from "request";
import lodash from "lodash";
import axios from "axios";
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: 
const fetchData = async (req, res, next) => {
  try {
 const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs',{
  headers: {
       'x-hasura-admin-secret':'32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
    }
  }
) 
 req.blogs = response.data.blogs;
}
catch(e) {
   res.status(500).json({ error: 'Internal Server Error middleware' });
}
next();
}
const setCacheExpiry = (req, res, next) => {
  // Setting lodash expiry to 2 minutes from current time
      const now = new Date();
      now.setMinutes(now.getMinutes() + 2);
      const key =` ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}-${now.getHours()}-${now.getMinutes()}-${Math.floor(now.getSeconds() / 10)}`
      req.timeOut =  key;
    
    next();
}
app.use(fetchData);

app.get("/api/blog-stats" , setCacheExpiry,(req, res ) => {
  const blogs = req.blogs;
   const blogsSize = lodash.size(blogs)
   const longestTitle = lodash.maxBy(blogs,"title.length")
   const uniqueTitle = lodash.uniqBy(blogs, "title").map(blog => blog.title)
   const titleWithPrivacy = lodash.filter(blogs, blog => lodash.includes(blog.title.toLowerCase(), 'privacy'));
   res.status(200).json({"Total blogs size :": blogsSize,"Longest title in the blogs: ":longestTitle,"Blogs with unique titles":uniqueTitle, "blogs containing privacy in their title:":titleWithPrivacy});
  })
app.get("/api/blog-search" , setCacheExpiry, async(req, res ) => {
   if(Object.keys(req.query).length === 0) {
     res.status(400).json({msg:"No search parameter given"});
  }
  else {
 try {
    function searchFunction() { console.log("ran fetch data"); return lodash.filter(req.blogs, blog => lodash.includes(blog.title, req.query.query)); }
   const cashedSearchResult =  lodash.memoize(searchFunction);
   const searchResult =  cashedSearchResult()
   res.status(200).json({searchResult})
   }catch(e) {
    res.status(500).json({ error: 'Internal Server Error' });
   }
    }
  })
 
const PORT = 3000;
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));