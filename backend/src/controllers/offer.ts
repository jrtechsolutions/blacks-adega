import { Request, Response } from 'express';
import * as OfferService from '../services/offer';

export const getAll = async (req: Request, res: Response) => {
  const offers = await OfferService.getAll();
  res.json(offers);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const offer = await OfferService.getById(id);
  if (!offer) return res.status(404).json({ error: 'Oferta não encontrada' });
  res.json(offer);
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('[Oferta] POST /offers - recebido', { name: data.name, price: data.price });
    const offer = await OfferService.create(data);
    console.log('[Oferta] Oferta criada com sucesso', { id: offer.id, name: offer.name });
    res.status(201).json(offer);
  } catch (error) {
    console.error('[Oferta] Erro ao criar oferta:', error);
    res.status(500).json({ error: 'Erro ao criar oferta' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const offer = await OfferService.update(id, data);
  res.json(offer);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await OfferService.remove(id);
  res.status(204).send();
};

export const toggleActive = async (req: Request, res: Response) => {
  const { id } = req.params;
  const offer = await OfferService.toggleActive(id);
  res.json(offer);
};

export const offerController = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleActive
}; 