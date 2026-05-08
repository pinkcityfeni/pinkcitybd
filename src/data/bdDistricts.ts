// All 64 districts of Bangladesh
export const BD_DISTRICTS_EN = [
  'Bagerhat','Bandarban','Barguna','Barisal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram','Chuadanga',
  'Cox\'s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj','Habiganj',
  'Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachhari','Khulna','Kishoreganj','Kurigram','Kushtia',
  'Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon',
  'Narail','Narayanganj','Narsingdi','Natore','Nawabganj','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh',
  'Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj',
  'Sunamganj','Sylhet','Tangail','Thakurgaon',
] as const;

export const BD_DISTRICTS_BN: Record<string, string> = Object.fromEntries(
  BD_DISTRICTS_EN.map((d) => [d, d])
);

const _UNUSED_BD_LEGACY = {
  'Bagerhat': 'Bagerhat','Bandarban': 'Bandarban',
  'Narail': 'Narail','Narayanganj': 'Narayanganj','Narsingdi': 'Narsingdi','Natore': 'Natore','Nawabganj': 'Nawabganj',
  'Netrokona': 'Netrokona','Nilphamari': 'Nilphamari','Noakhali': 'Noakhali','Pabna': 'Pabna','Panchagarh': 'Panchagarh',
  'Patuakhali': 'Patuakhali','Pirojpur': 'Pirojpur','Rajbari': 'Rajbari','Rajshahi': 'Rajshahi','Rangamati': 'Rangamati',
  'Rangpur': 'Rangpur','Satkhira': 'Satkhira','Shariatpur': 'Shariatpur','Sherpur': 'Sherpur','Sirajganj': 'Sirajganj',
  'Sunamganj': 'Sunamganj','Sylhet': 'Sylhet','Tangail': 'Tangail','Thakurgaon': 'Thakurgaon',
};