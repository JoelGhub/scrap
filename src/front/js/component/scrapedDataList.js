import React from "react";

const ScrapedDataList = ({ scrapedData }) => {
  return (
    <div>
      <h2>User Page</h2>
      <ul>
        {scrapedData.map((data) => (
          <li key={data.id}>
            <strong>URL:</strong> {data.url}<br />
            <strong>Content:</strong><br />
            <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScrapedDataList;
