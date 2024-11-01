import { useEffect, useState } from 'react';
import Select from 'react-select';
import useSWR from 'swr';

async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Could not fetch the data');
  }
  return res.json();
}

const formatOptionLabel = ({ value, label }) => (
  <div className="flex items-center space-x-5">
    <span>{value}</span>
    <span>{label}</span>
  </div>
);

const CountrySelector = (props) => {
  const { onChange } = props;
  const langUrl = 'https://restcountries.com/v2/all?fields=languages';
  const { data: langData, error } = useSWR(langUrl, fetcher);

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (error || !langData) {
      return;
    }

    let languages = [];

    langData.forEach((entry) => {
      languages = [...languages, ...entry.languages];
    });
    languages = Array.from(new Set(languages.map((language) => language.iso639_1))).map(
      (iso639_1) => languages.find((language) => language.iso639_1 === iso639_1)
    );

    const _options = languages.map(({ iso639_1, name }) => ({
      value: iso639_1,
      label: name,
      code: iso639_1,
    }));

    setOptions(_options);
  }, [langData, error]);

  if (error) return <div>failed to load</div>;
  if (!langData) return <div>loading...</div>;

  return (
    <Select
      options={options}
      onChange={onChange}
      isSearchable
      isDisabled={!options.length}
      formatOptionLabel={formatOptionLabel}
    />
  );
};

export default CountrySelector;
